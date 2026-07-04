import { prisma } from "@/lib/prisma";
import ShopUI from "./ShopUI";
import { Suspense } from "react";

// Keeps the cache-buster so new Admin drops show up instantly!
export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  
  // 1. Fetch the fresh gear from the store
  const rawProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reviews: {
        select: { rating: true }
      }
    }
  });

  // 2. Clean the data for the Client UI
  const safeProducts = rawProducts.map((product: any) => ({
    ...product,
    id: product.id, 
    price: product.price.toString(),
    createdAt: product.createdAt.toISOString(),
  }));


  // 3. Pass the data to the UI
  return (
    <Suspense fallback={<div className="min-h-screen bg-white text-slate-500 flex items-center justify-center font-sans text-sm">Loading the Shop...</div>}>
      <ShopUI products={safeProducts} />
    </Suspense>
  );
}