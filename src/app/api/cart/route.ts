import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    const formattedCart = cartItems.map(item => ({
      id: item.productId,
      name: item.product.name,
      price: `$${item.product.price.toString()}`,
      image: item.product.images[0],
      size: item.size,
      quantity: item.quantity
    }));

    return NextResponse.json(formattedCart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cart } = await req.json();

    await prisma.$transaction(async (tx) => {
      // Clear out existing items to replace them with the current client cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      if (cart && cart.length > 0) {
        await tx.cartItem.createMany({
          data: cart.map((item: any) => ({
            userId,
            productId: item.id,
            size: item.size,
            quantity: item.quantity
          }))
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}
