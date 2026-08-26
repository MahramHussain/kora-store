import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { isCustomJersey } from "@/lib/constants";
import { getPromoDiscount } from "@/lib/promo";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user or handle Guest checkout
    const { userId } = await auth();
    const clerkUser = await currentUser();

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
      coordinates,
      sellerNote,
      bypassPayment
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

    // C. Determine User Account and Order Email
    let orderUserId = "";
    let targetEmail = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (userId && clerkUser) {
      // Authenticated Clerk User
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (dbUser) {
        const isBanned = dbUser.isBanned || (dbUser.bannedUntil && new Date() < new Date(dbUser.bannedUntil));
        const isShadowBanned = dbUser.isShadowBanned && (!dbUser.shadowBanExpiresAt || new Date() < new Date(dbUser.shadowBanExpiresAt));
        if (isBanned || isShadowBanned) {
          return new NextResponse("Forbidden: Your account is restricted. Checkout blocked.", { status: 403 });
        }
      }

      targetEmail = clerkUser.emailAddresses[0].emailAddress.toLowerCase().trim();

      // Check if user already exists by email (with different ID)
      const existingUser = await prisma.user.findUnique({
        where: { email: targetEmail }
      });

      if (existingUser && existingUser.id !== userId) {
        // Clean up or transition old duplicate placeholder
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
          email: targetEmail,
          firstName: clerkUser.firstName || shippingDetails.firstName.trim() || "Kora",
          lastName: clerkUser.lastName || shippingDetails.lastName.trim() || "Shopper",
          phone: cleanPhone
        }
      });

      orderUserId = userId;
    } else {
      // Guest Checkout Flow
      const guestEmail = (shippingDetails.email || body.email || "").toLowerCase().trim();
      if (!guestEmail || !emailRegex.test(guestEmail)) {
        return new NextResponse("Please enter a valid email address for guest checkout.", { status: 400 });
      }

      targetEmail = guestEmail;

      // Check if user record already exists for this email
      const existingUser = await prisma.user.findUnique({
        where: { email: targetEmail }
      });

      if (existingUser) {
        const isBanned = existingUser.isBanned || (existingUser.bannedUntil && new Date() < new Date(existingUser.bannedUntil));
        const isShadowBanned = existingUser.isShadowBanned && (!existingUser.shadowBanExpiresAt || new Date() < new Date(existingUser.shadowBanExpiresAt));
        if (isBanned || isShadowBanned) {
          return new NextResponse("Forbidden: Your account is restricted. Checkout blocked.", { status: 403 });
        }
        orderUserId = existingUser.id;
      } else {
        // Create new guest user record
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const newGuestUser = await prisma.user.create({
          data: {
            id: guestId,
            email: targetEmail,
            firstName: shippingDetails.firstName.trim() || "Guest",
            lastName: shippingDetails.lastName.trim() || "Shopper",
            phone: cleanPhone
          }
        });
        orderUserId = newGuestUser.id;
      }
    }

    // Validate that custom-named items do not use COD
    const hasCustomPrint = items.some((item: any) => isCustomJersey(item));
    if (hasCustomPrint && paymentMethod === "cod") {
      return new NextResponse("Cash on Delivery is unavailable for custom-named shirts. Please pay by Card.", { status: 400 });
    }

    // Calculate and validate amounts on the backend
    const calculatedSubtotal = items.reduce((acc: number, item: any) => {
      const numericPrice = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
      return acc + (numericPrice * item.quantity);
    }, 0);

    // Validate promo code and calculate actual discount on the server
    let actualDiscount = 0;
    if (promoCode) {
      const discountPercent = getPromoDiscount(promoCode);
      if (discountPercent === 0) {
        return new NextResponse("Invalid promo code.", { status: 400 });
      }
      actualDiscount = calculatedSubtotal * discountPercent;
    }

    const netSubtotal = calculatedSubtotal - actualDiscount;
    const computedShippingFee = netSubtotal > 200 ? 0 : 25;
    const computedTotal = netSubtotal + computedShippingFee + parseFloat(tax || 0);

    // 3. Process checkout inside a robust transaction
    const order = await prisma.$transaction(async (tx) => {
      
      // A. Inventory Check & Lock
      for (const item of items) {
        const dbProduct = await tx.product.findUnique({
          where: { id: item.id },
          include: { sizeStocks: true, playerStocks: true }
        });

        if (!dbProduct) {
          throw new Error(`Product not found: ${item.name}`);
        }

        // Find size-specific stock if sizeStocks are initialized
        if (dbProduct.sizeStocks && dbProduct.sizeStocks.length > 0) {
          const sizeStockMatch = dbProduct.sizeStocks.find((s: any) => s.size === item.size);
          if (!sizeStockMatch) {
            throw new Error(`Size ${item.size} is unavailable for product ${dbProduct.name}`);
          }
          if (sizeStockMatch.quantity < item.quantity) {
            throw new Error(`Insufficient stock for size ${item.size} of product ${dbProduct.name}`);
          }

          // Decrement specific SizeStock quantity
          await tx.sizeStock.update({
            where: { id: sizeStockMatch.id },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        } else {
          // Fallback to global stock check
          if (dbProduct.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${dbProduct.name}`);
          }
        }

        // Check player name stock if a preset player name is chosen
        if (item.playerName && dbProduct.playerStocks && dbProduct.playerStocks.length > 0) {
          const playerStockMatch = dbProduct.playerStocks.find(
            (s: any) => s.playerName.toUpperCase() === item.playerName.toUpperCase()
          );
          if (playerStockMatch) {
            if (playerStockMatch.quantity < item.quantity) {
              throw new Error(`Insufficient stock for player ${item.playerName} of product ${dbProduct.name}`);
            }

            // Decrement specific PlayerStock quantity
            await tx.playerStock.update({
              where: { id: playerStockMatch.id },
              data: {
                quantity: {
                  decrement: item.quantity
                }
              }
            });
          }
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
        referenceNumber = `KORA-${Date.now().toString().slice(-4)}`;
      }

      // D. Create the Order
      const newOrder = await tx.order.create({
        data: {
          userId: orderUserId,
          total: new Prisma.Decimal(computedTotal),
          status: paymentMethod === "card" ? "Pending" : "Processing",
          shippingStreet: shippingDetails.streetAddress,
          shippingCity: shippingDetails.city,
          shippingPhone: cleanPhone,
          shippingName: `${shippingDetails.firstName.trim()} ${shippingDetails.lastName.trim()}`,
          paymentMethod: paymentMethod,
          promoCode: promoCode || null,
          discountAmount: new Prisma.Decimal(actualDiscount),
          shippingFee: new Prisma.Decimal(computedShippingFee),
          tax: new Prisma.Decimal(tax || 0),
          referenceNumber: referenceNumber,
          sellerNote: sellerNote || "",
          latitude: coordinates && typeof coordinates.lat === "number" ? coordinates.lat : null,
          longitude: coordinates && typeof coordinates.lng === "number" ? coordinates.lng : null,
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              size: item.size,
              image: item.image || "",
              quantity: item.quantity,
              price: new Prisma.Decimal(parseFloat(item.price.toString().replace(/[^0-9.]/g, ''))),
              customName: item.customName || "",
              customNumber: item.customNumber || "",
              playerName: item.playerName || "",
              patch: item.patch || "",
              sellerNote: item.sellerNote || "",
            })),
          },
        },
      });

      // E. Clear Database Synced Cart Items (Only if logged in user and NOT card payment)
      if (userId && paymentMethod !== "card") {
        await tx.cartItem.deleteMany({
          where: { userId }
        });
      }

      return newOrder;
    });

    // 4. Handle Redirection-based Payments (Card/Ziina)
    if (paymentMethod === "card") {
      const baseUrl = new URL(req.url).origin;

      const userEmail = clerkUser?.emailAddresses[0]?.emailAddress;
      const isUserAdmin = userEmail === "mahramh40@gmail.com" || userEmail === "korastore.ae@gmail.com";
      const executeBypass = bypassPayment === true && isUserAdmin;

      if (executeBypass) {
        const mockPaymentIntentId = "admin_bypass_pi_" + Math.random().toString(36).slice(2, 11);
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentIntentId: mockPaymentIntentId }
        });
        const redirectUrl = `${baseUrl}/success?ref=${order.referenceNumber}&payment_intent_id=${mockPaymentIntentId}`;
        return NextResponse.json({ redirectUrl });
      }

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
        const numericPrice = parseFloat(item.price.toString().replace(/[^0-9.]/g, ""));
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
          playerName: item.playerName || "",
          patch: item.patch || "",
          sellerNote: item.sellerNote || "",
        })),
        subtotal: `AED ${calculatedSubtotal.toFixed(2)}`,
        shippingFee: `AED ${parseFloat(order.shippingFee.toString()).toFixed(2)}`,
        discount: `AED ${parseFloat(order.discountAmount.toString()).toFixed(2)}`,
        total: `AED ${parseFloat(order.total.toString()).toFixed(2)}`,
        shippingAddress: `${shippingDetails.streetAddress}, ${shippingDetails.city}, UAE`,
        sellerNote: order.sellerNote || "",
      };

      // A. Send confirmation to customer (Guest or Logged in)
      if (targetEmail) {
        await sendOrderConfirmationEmail({
          ...emailParams,
          toEmail: targetEmail,
          isAdminAlert: false,
        });
      }

      // B. Build map pinpoint link only for store admin notification
      let adminShippingAddress = `${shippingDetails.streetAddress}, ${shippingDetails.city}, UAE`;
      if (coordinates && typeof coordinates.lat === "number" && typeof coordinates.lng === "number") {
        adminShippingAddress += `<br/><br/>📍 <strong>Google Maps Location Pinpoint</strong>:<br/><a href="https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}" style="color: #6b00ff; font-weight: bold; text-decoration: underline;">Open Google Maps Link</a><br/>(Coords: ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)})`;
      }

      // C. Send notification alert to store admins
      const adminEmails = ["korastore.ae@gmail.com"];
      for (const email of adminEmails) {
        await sendOrderConfirmationEmail({
          ...emailParams,
          shippingAddress: adminShippingAddress,
          toEmail: email,
          isAdminAlert: true,
        });
      }

      console.log(`📬 [EMAIL SUCCESS] - Direct COD Order emails sent to customer (${targetEmail}) and admin for KORA-${order.referenceNumber}`);
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