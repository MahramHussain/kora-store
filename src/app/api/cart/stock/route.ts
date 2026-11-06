import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: Array<{ id: string | number; size: string; playerName?: string }> = body?.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ stocks: {} });
    }

    const uniqueProductIds = Array.from(new Set(items.map((i) => String(i.id)).filter(Boolean)));

    const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds } },
      select: {
        id: true,
        stock: true,
        sizeStocks: {
          select: {
            size: true,
            quantity: true,
          },
        },
        playerStocks: {
          select: {
            playerName: true,
            quantity: true,
          },
        },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const stocks: Record<string, number> = {};

    for (const item of items) {
      const pid = String(item.id);
      const product = productMap.get(pid);
      const key = `${pid}___${item.size || ""}___${item.playerName || ""}`;

      if (!product) {
        stocks[key] = 0;
        continue;
      }

      let availableStock = product.stock ?? 0;

      // 1. Check size-specific stock if sizeStocks is populated
      if (product.sizeStocks && product.sizeStocks.length > 0 && item.size) {
        const sizeMatch = product.sizeStocks.find(
          (s) => s.size.trim().toLowerCase() === item.size.trim().toLowerCase()
        );
        availableStock = sizeMatch ? Math.max(0, sizeMatch.quantity) : 0;
      }

      // 2. Check player-specific stock if a player was selected
      if (item.playerName && product.playerStocks && product.playerStocks.length > 0) {
        const playerMatch = product.playerStocks.find(
          (p) => p.playerName.trim().toLowerCase() === item.playerName?.trim().toLowerCase()
        );
        if (playerMatch) {
          availableStock = Math.min(availableStock, Math.max(0, playerMatch.quantity));
        }
      }

      stocks[key] = Math.max(0, availableStock);
    }

    return NextResponse.json({ stocks });
  } catch (error) {
    console.error("[CartStockAPI] Error checking cart stock:", error);
    return NextResponse.json({ error: "Failed to check stock" }, { status: 500 });
  }
}

