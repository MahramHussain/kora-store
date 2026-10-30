import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// Cached fetcher for public products list
const getCachedPublicProducts = unstable_cache(
  async () => {
    const rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        nameAr: true,
        category: true,
        team: true,
        price: true,
        originalPrice: true,
        tag: true,
        stock: true,
        images: true,
        description: true,
        descriptionAr: true,
        createdAt: true,
        reviews: {
          select: { rating: true }
        }
      }
    });

    return rawProducts.map((p) => ({
      ...p,
      // Only serve the primary image in list/grid view to minimize payload & transfer
      images: p.images && p.images.length > 0 ? [p.images[0]] : [],
      price: p.price.toString(),
      originalPrice: p.originalPrice ? p.originalPrice.toString() : null,
      createdAt: p.createdAt.toISOString(),
    }));
  },
  ["public-products-api-cache"],
  { revalidate: 300, tags: ["products", "shop-products"] }
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shouldRefresh = searchParams.get("refresh") === "true";

    let products;
    if (shouldRefresh) {
      // Direct uncached database query for instant admin / forced refresh checks
      const freshRaw = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          nameAr: true,
          category: true,
          team: true,
          price: true,
          originalPrice: true,
          tag: true,
          stock: true,
          images: true,
          description: true,
          descriptionAr: true,
          createdAt: true,
          reviews: {
            select: { rating: true }
          }
        }
      });

      products = freshRaw.map((p) => ({
        ...p,
        images: p.images && p.images.length > 0 ? [p.images[0]] : [],
        price: p.price.toString(),
        originalPrice: p.originalPrice ? p.originalPrice.toString() : null,
        createdAt: p.createdAt.toISOString(),
      }));

      return NextResponse.json(
        { success: true, count: products.length, products },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "CDN-Cache-Control": "no-store",
            "Vercel-CDN-Cache-Control": "no-store",
          },
        }
      );
    }

    // Standard cached route: served via Next.js Data Cache & Vercel Edge CDN
    products = await getCachedPublicProducts();

    return NextResponse.json(
      { success: true, count: products.length, products },
      {
        status: 200,
        headers: {
          // Instruct browser to cache for 1 minute, Vercel CDN for 5 minutes, and serve stale while revalidating
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
          "Vercel-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Public products API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

