import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref");
    if (!ref) {
      return new NextResponse("Missing order reference", { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { referenceNumber: ref },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Verify ownership or admin status
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    const isAdmin = email === "mahramh40@gmail.com" || email === "korastore.ae@gmail.com";

    if (order.userId !== userId && !isAdmin) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order: {
        referenceNumber: order.referenceNumber,
        total: order.total.toString(),
        subtotal: order.items.reduce((acc, item) => acc + (parseFloat(item.price.toString()) * item.quantity), 0).toFixed(2),
        discountAmount: order.discountAmount.toString(),
        shippingFee: order.shippingFee.toString(),
        shippingName: order.shippingName,
        shippingStreet: order.shippingStreet,
        shippingCity: order.shippingCity,
        shippingPhone: order.shippingPhone,
        sellerNote: order.sellerNote,
        items: order.items.map((item) => ({
          name: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price.toString(),
          customName: item.customName,
          customNumber: item.customNumber,
          playerName: item.playerName,
          patch: item.patch,
          sellerNote: item.sellerNote
        }))
      }
    });

  } catch (error: any) {
    console.error("[GET_ORDER_DETAILS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
