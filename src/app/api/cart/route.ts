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

    const PRESET_PLAYERS: Record<string, Array<{ name: string; number: string }>> = {
      "ARGENTINA AWAY": [{ name: "MESSI", number: "10" }],
      "BRAZIL AWAY": [{ name: "NEYMAR", number: "10" }, { name: "VINI", number: "7" }, { name: "RAPHINHA", number: "11" }],
      "FRANCE AWAY": [{ name: "MBAPPE", number: "10" }, { name: "OLISE", number: "11" }, { name: "DEMBELE", number: "7" }],
      "PORTUGAL AWAY": [{ name: "RONALDO", number: "7" }],
      "SPAIN AWAY": [{ name: "LAMINE YAMAL", number: "19" }, { name: "PEDRI", number: "20" }],
      "ARGENTINA HOME": [{ name: "MESSI", number: "10" }],
      "BRAZIL HOME": [{ name: "NEYMAR", number: "10" }],
      "FRANCE HOME": [{ name: "MBAPPE", number: "10" }, { name: "DEMBELE", number: "7" }],
      "PORTUGAL HOME": [{ name: "RONALDO", number: "7" }],
      "SPAIN HOME": [{ name: "LAMINE YAMAL", number: "19" }, { name: "PEDRI", number: "20" }],
    };

    const formattedCart = cartItems.map(item => {
      const basePrice = parseFloat(item.product.price.toString());
      const hasCustomPrint = (item.customName && item.customName.trim() !== "") || (item.customNumber && item.customNumber.trim() !== "");
      
      let printUpcharge = 0;
      if (hasCustomPrint) {
        const productName = item.product.name.toUpperCase().replace(/\s+KIT$/i, "").trim();
        const presets = PRESET_PLAYERS[productName] || [];
        const isPreset = presets.some(p => p.name === item.customName.trim().toUpperCase() && p.number === item.customNumber.trim());
        printUpcharge = isPreset ? 15 : 25;
      }
      const finalPrice = basePrice + printUpcharge;

      return {
        id: item.productId,
        name: item.product.name,
        price: `$${finalPrice.toFixed(2)}`,
        image: item.image || item.product.images[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png",
        size: item.size,
        quantity: item.quantity,
        customName: item.customName,
        customNumber: item.customNumber
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
            image: item.image || "",
            quantity: item.quantity,
            customName: item.customName || "",
            customNumber: item.customNumber || ""
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
