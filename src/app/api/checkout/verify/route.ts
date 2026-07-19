import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { CURRENCY } from "@/lib/constants";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { referenceNumber, paymentIntentId } = await req.json();

    if (!referenceNumber || !paymentIntentId) {
      return new NextResponse("Missing verification parameters", { status: 400 });
    }

    // Find the order, including the associated user and order items
    const order = await prisma.order.findUnique({
      where: { referenceNumber },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // If already paid/processing, return success instantly to prevent duplicate notifications
    if (order.status !== "Pending") {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    let isPaid = false;

    // Check if Mock payment or Live payment or Admin bypass
    if (paymentIntentId.startsWith("mock_pi_")) {
      isPaid = true;
    } else if (paymentIntentId.startsWith("admin_bypass_pi_")) {
      const clerkUser = await currentUser();
      const userEmail = clerkUser?.emailAddresses[0]?.emailAddress;
      const isUserAdmin = userEmail === "mahramh40@gmail.com" || userEmail === "korastore.ae@gmail.com";
      const isOrderOwnerAdmin = order.user.email === "mahramh40@gmail.com" || order.user.email === "korastore.ae@gmail.com";

      if (isUserAdmin && isOrderOwnerAdmin) {
        isPaid = true;
      } else {
        return new NextResponse("Unauthorized. Admin bypass restricted.", { status: 403 });
      }
    } else {
      if (!process.env.ZIINA_API_KEY) {
        return new NextResponse("Ziina API credentials missing on server", { status: 500 });
      }

      const response = await fetch(`https://api-v2.ziina.com/api/payment_intent/${paymentIntentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.ZIINA_API_KEY}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Ziina verification failed:", errText);
        return new NextResponse("Verification call failed", { status: 400 });
      }

      const data = await response.json();
      if (data.status === "completed") {
        isPaid = true;
      }
    }

    if (!isPaid) {
      return NextResponse.json({ success: false, error: "Payment not completed" });
    }

    // Payment is verified! Update order status and clear user cart
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "Processing",
          paymentIntentId
        }
      });

      await tx.cartItem.deleteMany({
        where: { userId: order.userId }
      });
    });

    // Send confirmation emails
    try {
      const calculatedSubtotal = order.items.reduce((total: number, item: any) => {
        return total + (parseFloat(item.price.toString()) * item.quantity);
      }, 0);

      const emailParams = {
        customerName: order.shippingName || `${order.user.firstName || "Kora"} ${order.user.lastName || "Shopper"}`,
        referenceNumber: order.referenceNumber || "",
        items: order.items.map((item: any) => ({
          name: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: `${CURRENCY}${parseFloat(item.price.toString()).toFixed(2)}`,
          customName: item.customName || "",
          customNumber: item.customNumber || "",
          playerName: item.playerName || "",
          patch: item.patch || "",
          sellerNote: item.sellerNote || "",
        })),
        subtotal: `${CURRENCY}${calculatedSubtotal.toFixed(2)}`,
        shippingFee: `${CURRENCY}${parseFloat(order.shippingFee.toString()).toFixed(2)}`,
        discount: `${CURRENCY}${parseFloat(order.discountAmount.toString()).toFixed(2)}`,
        total: `${CURRENCY}${parseFloat(order.total.toString()).toFixed(2)}`,
        shippingAddress: `${order.shippingStreet}, ${order.shippingCity}, UAE`,
        sellerNote: order.sellerNote || "",
      };

      // A. Send confirmation to customer
      await sendOrderConfirmationEmail({
        ...emailParams,
        toEmail: order.user.email,
        isAdminAlert: false,
      });

      // B. Build map pinpoint link only for store admin notification
      let adminShippingAddress = `${order.shippingStreet}, ${order.shippingCity}, UAE`;
      if (order.latitude !== null && order.longitude !== null) {
        adminShippingAddress += `<br/><br/>📍 <strong>Google Maps Location Pinpoint</strong>:<br/><a href="https://www.google.com/maps?q=${order.latitude},${order.longitude}" style="color: #6b00ff; font-weight: bold; text-decoration: underline;">Open Google Maps Link</a><br/>(Coords: ${order.latitude.toFixed(6)}, ${order.longitude.toFixed(6)})`;
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

      console.log(`📬 [EMAIL SUCCESS] - Ziina Verified Order emails sent for KORA-${order.referenceNumber}`);
    } catch (emailErr) {
      console.error("⚠️ Order confirmation emails failed to transmit during verification:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[VERIFY_PAYMENT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
