import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PRESET_PLAYERS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });


    const formattedCart = cartItems.map(item => {
      const basePrice = parseFloat(item.product.price.toString());
      const hasCustomPrint = (item.customName && item.customName.trim() !== "") || (item.customNumber && item.customNumber.trim() !== "");
      
      let printUpcharge = 0;
      if (hasCustomPrint) {
        const productName = item.product.name.toUpperCase().replace(/\s+KIT.*$/i, "").trim();
        const presets = PRESET_PLAYERS[productName] || [];
        const isPreset = presets.some(p => p.name === item.customName.trim().toUpperCase() && p.number === item.customNumber.trim());
        printUpcharge = isPreset ? 15 : 25;
      }
      const patchUpcharge = item.patch ? 10 : 0;
      const finalPrice = basePrice + printUpcharge + patchUpcharge;

      return {
        id: item.productId,
        name: item.product.name,
        price: `$${finalPrice.toFixed(2)}`,
        image: item.image || item.product.images[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png",
        size: item.size,
        quantity: item.quantity,
        customName: item.customName || undefined,
        customNumber: item.customNumber || undefined,
        playerName: item.playerName || undefined,
        patch: item.patch || undefined,
        sellerNote: item.sellerNote || undefined
      };
    });

    return NextResponse.json(formattedCart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
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
            image: item.image || "",
            quantity: item.quantity,
            customName: item.customName || "",
            customNumber: item.customNumber || "",
            playerName: item.playerName || "",
            patch: item.patch || "",
            sellerNote: item.sellerNote || ""
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
