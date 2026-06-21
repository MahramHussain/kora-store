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

    // Ensure Clerk user is registered locally in DB
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
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
          status: "Processing",
          shippingStreet: shippingDetails.streetAddress,
          shippingCity: shippingDetails.city,
          shippingPhone: shippingDetails.phone,
          shippingName: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
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
            })),
          },
        },
      });

      // E. Clear Database Synced Cart Items
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return newOrder;
    });

    // 4. Trigger Email Notifications using Resend API
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
        })),
        subtotal: `AED ${calculatedSubtotal.toFixed(2)}`,
        shippingFee: `AED ${parseFloat(order.shippingFee.toString()).toFixed(2)}`,
        discount: `AED ${parseFloat(order.discountAmount.toString()).toFixed(2)}`,
        total: `AED ${parseFloat(order.total.toString()).toFixed(2)}`,
        shippingAddress: `${shippingDetails.streetAddress}, ${shippingDetails.city}, UAE`,
      };

      // A. Send confirmation to customer (no coordinates map link)
      await sendOrderConfirmationEmail({
        ...emailParams,
        toEmail: clerkUser.emailAddresses[0].emailAddress,
      });

      // B. Build map pinpoint link only for store admin notification
      let adminShippingAddress = `${shippingDetails.streetAddress}, ${shippingDetails.city}, UAE`;
      if (coordinates && typeof coordinates.lat === "number" && typeof coordinates.lng === "number") {
        adminShippingAddress += `<br/><br/>📍 <strong>Google Maps Location Pinpoint</strong>:<br/><a href="https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}" style="color: #6b00ff; font-weight: bold; text-decoration: underline;">Open Google Maps Link</a><br/>(Coords: ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)})`;
      }

      // C. Send notification alert to store admin (mahramh40@gmail.com)
      await sendOrderConfirmationEmail({
        ...emailParams,
        shippingAddress: adminShippingAddress,
        toEmail: "mahramh40@gmail.com",
      });

      console.log(`📬 [EMAIL SUCCESS] - Order emails sent to customer and admin for KORA-${order.referenceNumber}`);
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