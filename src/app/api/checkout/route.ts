import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return new NextResponse("Unauthorized. Please log in.", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (dbUser) {
      const isBanned = dbUser.isBanned || (dbUser.bannedUntil && new Date() < new Date(dbUser.bannedUntil));
      const isShadowBanned = dbUser.isShadowBanned && (!dbUser.shadowBanExpiresAt || new Date() < new Date(dbUser.shadowBanExpiresAt));
      if (isBanned || isShadowBanned) {
        return new NextResponse("Forbidden: Your account is restricted. Checkout blocked.", { status: 403 });
      }
    }

    // 2. Parse checkout data from request body
    const body = await req.json();
    const {
      items,
      cartTotal,
      shippingDetails,
      paymentMethod,
      promoCode,
      discountAmount,
      shippingFee,
      tax,
      coordinates
    } = body;

    if (!items || items.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 });
    }

    if (!shippingDetails || !shippingDetails.firstName || !shippingDetails.lastName || !shippingDetails.streetAddress || !shippingDetails.city || !shippingDetails.phone) {
      return new NextResponse("Missing shipping details", { status: 400 });
    }

    // A. Validate First and Last Name (Only letters, spaces, hyphens, and apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(shippingDetails.firstName.trim()) || !nameRegex.test(shippingDetails.lastName.trim())) {
      return new NextResponse("Names can only contain letters, spaces, hyphens, or apostrophes.", { status: 400 });
    }

    // B. Validate UAE Phone Number
    const cleanPhone = shippingDetails.phone.replace(/[^\d+]/g, "");
    const uaePhoneRegex = /^(?:\+971|00971|971)?(?:5[024568]\d{7}|[234679]\d{7})$/;
    const localUaePhoneRegex = /^0(?:5[024568]\d{7}|[234679]\d{7})$/;

    if (!uaePhoneRegex.test(cleanPhone) && !localUaePhoneRegex.test(cleanPhone)) {
      return new NextResponse("Please enter a valid UAE phone number.", { status: 400 });
    }

    // Validate that personalized items do not use COD
    const hasPersonalizedItem = items.some((item: any) => 
      (item.customName && item.customName.trim() !== "") || 
      (item.customNumber && item.customNumber.trim() !== "")
    );
    if (hasPersonalizedItem && paymentMethod === "cod") {
      return new NextResponse("Cash on Delivery is unavailable for personalized custom kits. Please pay by Card.", { status: 400 });
    }

    const userEmail = clerkUser.emailAddresses[0].emailAddress;

    // Check if user already exists by email (with different ID)
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (existingUser && existingUser.id !== userId) {
      // Clean up old relations for this email (since the user is transitioning Clerk instances)
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { userId: existingUser.id } }),
        prisma.review.deleteMany({ where: { userId: existingUser.id } }),
        prisma.orderItem.deleteMany({ where: { order: { userId: existingUser.id } } }),
        prisma.order.deleteMany({ where: { userId: existingUser.id } }),
        prisma.user.delete({ where: { id: existingUser.id } })
      ]);
    }

    // Ensure Clerk user is registered locally in DB
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: userEmail,
        firstName: clerkUser.firstName || "Kora",
        lastName: clerkUser.lastName || "Shopper",
      }
    });

    // 3. Process checkout inside a robust transaction
    const order = await prisma.$transaction(async (tx) => {
      
      // A. Inventory Check & Lock
      for (const item of items) {
        const dbProduct = await tx.product.findUnique({
          where: { id: item.id }
        });

        if (!dbProduct) {
          throw new Error(`Product not found: ${item.name}`);
        }

        if (dbProduct.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${dbProduct.name}`);
        }

        // B. Decrement Product Stock
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // C. Generate Unique Reference Number (KORA-XXXX)
      let referenceNumber = "";
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        referenceNumber = `KORA-${rand}`;
        const existingOrder = await tx.order.findUnique({
          where: { referenceNumber }
        });
        if (!existingOrder) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        // Fallback to timestamp prefix if randomly generating fails
        referenceNumber = `KORA-${Date.now().toString().slice(-4)}`;
      }

      // D. Create the Order
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          total: new Prisma.Decimal(cartTotal),
          status: paymentMethod === "card" ? "Pending" : "Processing",
          shippingStreet: shippingDetails.streetAddress,
          shippingCity: shippingDetails.city,
          shippingPhone: cleanPhone,
          shippingName: `${shippingDetails.firstName.trim()} ${shippingDetails.lastName.trim()}`,
          paymentMethod: paymentMethod,
          promoCode: promoCode || null,
          discountAmount: new Prisma.Decimal(discountAmount || 0),
          shippingFee: new Prisma.Decimal(shippingFee || 10),
          tax: new Prisma.Decimal(tax || 0),
          referenceNumber: referenceNumber,
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              size: item.size,
              image: item.image || "",
              quantity: item.quantity,
              price: new Prisma.Decimal(parseFloat(item.price.replace('$', ''))),
              customName: item.customName || "",
              customNumber: item.customNumber || "",
            })),
          },
        },
      });

      // E. Clear Database Synced Cart Items (Only if NOT card payment!)
      if (paymentMethod !== "card") {
        await tx.cartItem.deleteMany({
          where: { userId }
        });
      }

      return newOrder;
    });

    // 4. Handle Redirection-based Payments (Card/Ziina)
    if (paymentMethod === "card") {
      const baseUrl = new URL(req.url).origin;
      const isMock = !process.env.ZIINA_API_KEY || process.env.ZIINA_API_KEY.includes("your_");

      if (isMock) {
        const mockPaymentIntentId = "mock_pi_" + Math.random().toString(36).slice(2, 11);
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentIntentId: mockPaymentIntentId }
        });
        const redirectUrl = `${baseUrl}/success?ref=${order.referenceNumber}&payment_intent_id=${mockPaymentIntentId}`;
        return NextResponse.json({ redirectUrl });
      } else {
        const filsAmount = Math.round(parseFloat(cartTotal) * 100);
        const response = await fetch("https://api-v2.ziina.com/api/payment_intent", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.ZIINA_API_KEY}`,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
          },
          body: JSON.stringify({
            amount: filsAmount,
            currency_code: "AED",
            success_url: `${baseUrl}/success?ref=${order.referenceNumber}&payment_intent_id={PAYMENT_INTENT_ID}`,
            cancel_url: `${baseUrl}/checkout`,
            failure_url: `${baseUrl}/checkout?error=payment_failed`
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Ziina API error: ${errText}`);
        }

        const data = await response.json();
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentIntentId: data.id }
        });

        return NextResponse.json({ redirectUrl: data.redirect_url });
      }
    }

    // 5. Trigger Immediate Email Notifications for direct COD orders
    try {
      const calculatedSubtotal = items.reduce((total: number, item: any) => {
        const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, ""));
        return total + (numericPrice * item.quantity);
      }, 0);

      const emailParams = {
        customerName: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
        referenceNumber: order.referenceNumber || "",
        items: items.map((item: any) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          customName: item.customName || "",
          customNumber: item.customNumber || "",
        })),
        subtotal: `AED ${calculatedSubtotal.toFixed(2)}`,
        shippingFee: `AED ${parseFloat(order.shippingFee.toString()).toFixed(2)}`,
        discount: `AED ${parseFloat(order.discountAmount.toString()).toFixed(2)}`,
        total: `AED ${parseFloat(order.total.toString()).toFixed(2)}`,
        shippingAddress: `${shippingDetails.streetAddress}, ${shippingDetails.city}, UAE`,
      };

      // A. Send confirmation to customer
      await sendOrderConfirmationEmail({
        ...emailParams,
        toEmail: clerkUser.emailAddresses[0].emailAddress,
      });

      // B. Build map pinpoint link only for store admin notification
      let adminShippingAddress = `${shippingDetails.streetAddress}, ${shippingDetails.city}, UAE`;
      if (coordinates && typeof coordinates.lat === "number" && typeof coordinates.lng === "number") {
        adminShippingAddress += `<br/><br/>📍 <strong>Google Maps Location Pinpoint</strong>:<br/><a href="https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}" style="color: #6b00ff; font-weight: bold; text-decoration: underline;">Open Google Maps Link</a><br/>(Coords: ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)})`;
      }

      // C. Send notification alert to store admin
      await sendOrderConfirmationEmail({
        ...emailParams,
        shippingAddress: adminShippingAddress,
        toEmail: "korastore.ae@gmail.com",
      });

      console.log(`📬 [EMAIL SUCCESS] - Direct COD Order emails sent to customer and admin for KORA-${order.referenceNumber}`);
    } catch (emailErr) {
      console.error("⚠️ Order confirmation emails failed to transmit:", emailErr);
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("[CHECKOUT_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Error";
    return new NextResponse(errorMessage, { status: 400 });
  }
}