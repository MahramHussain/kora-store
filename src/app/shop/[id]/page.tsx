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

  // Fetch users who have purchased this product
  const reviewerUserIds = rawProduct.reviews?.map((review: any) => review.userId) || [];
  
  const purchases = await prisma.order.findMany({
    where: {
      userId: { in: reviewerUserIds },
      items: {
        some: {
          productId: id
        }
      }
    },
    select: {
      userId: true
    }
  });

  const purchasedUserIds = new Set(purchases.map((p: any) => p.userId));

  const safeProduct = {
    ...rawProduct,
    price: rawProduct.price.toString(),
    originalPrice: rawProduct.originalPrice ? rawProduct.originalPrice.toString() : null,
    createdAt: rawProduct.createdAt?.toISOString() || null,
    reviews: rawProduct.reviews?.map((review: any) => ({
      ...review,
      createdAt: review.createdAt?.toISOString() || null,
      hasPurchased: purchasedUserIds.has(review.userId)
    })) || []
  };

  return <ProductUI product={safeProduct} />;
}