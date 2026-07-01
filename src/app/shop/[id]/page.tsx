import { prisma } from "@/lib/prisma";
import ProductUI from "./ProductUI";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params;

  // 1. Fetch reviews along with the user profiles to display correct custom/google avatars
  const rawProduct = await prisma.product.findUnique({
    where: { id: id },
    include: {
      reviews: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!rawProduct) {
    return notFound();
  }

  const safeProduct = {
    ...rawProduct,
    price: rawProduct.price.toString(),
    createdAt: rawProduct.createdAt?.toISOString() || null,
    reviews: rawProduct.reviews?.map((review: any) => ({
      ...review,
      createdAt: review.createdAt?.toISOString() || null
    })) || []
  };

  return <ProductUI product={safeProduct} />;
}