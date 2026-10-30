import { prisma } from "@/lib/prisma";
import ShopUI from "./ShopUI";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";

// Enable ISR caching at the edge (60s revalidation, instantly purged on admin updates via revalidatePath)
export const revalidate = 60;

// Cached fetcher for customer-facing shop products to eliminate repetitive Neon data transfers
const getCachedShopProducts = unstable_cache(
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

    return rawProducts.map((product) => ({
      ...product,
      // Only supply the primary image on the catalog grid to reduce heavy Base64 payload by 75%+
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : null,
      createdAt: product.createdAt.toISOString(),
    }));
  },
  ["shop-page-products-cache"],
  { revalidate: 60, tags: ["products", "shop-products"] }
);

export default async function ShopPage() {
  const safeProducts = await getCachedShopProducts();

  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950 text-slate-500 flex items-center justify-center font-sans text-sm">Loading the Shop...</div>}>
      <ShopUI products={safeProducts} />
    </Suspense>
  );
}
