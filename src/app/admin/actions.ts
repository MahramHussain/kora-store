"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { resolveImageFilename } from "@/lib/resolveImage";

// Helper to guarantee only the admin can call protected operations
async function ensureAdmin() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email || (email !== "mahramh40@gmail.com" && email !== "korastore.ae@gmail.com")) {
    throw new Error("Access Denied: Unauthorized");
  }
}

export async function getOrders() {
  try {
    await ensureAdmin();
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return orders.map(order => ({
      ...order,
      total: order.total.toString(),
      items: order.items.map(item => ({
        ...item,
        price: item.price.toString()
      }))
    }));
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export async function updateOrderFulfillment(orderId: string, status: string, trackingId: string | null) {
  try {
    await ensureAdmin();
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingId,
      },
    });
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error("Failed to update order:", error);
    return { success: false, error: "Failed to update order" };
  }
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    return products.map(product => ({
      ...product,
      price: product.price.toString()
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function deleteProduct(productId: string) {
  try {
    await ensureAdmin();
    await prisma.product.delete({
      where: { id: productId },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    if (error.code === 'P2003') {
      return { success: false, error: "Cannot delete this product because it has already been ordered by customers. Archiving options must be used instead." };
    }
    return { success: false, error: "An unexpected error occurred while deleting." };
  }
}

export async function getAdminStats() {
  try {
    await ensureAdmin();
    const [productCount, orderCount, products, orders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.product.findMany({ select: { price: true, stock: true } }),
      prisma.order.findMany({ select: { total: true } })
    ]);
    
    const totalValue = products.reduce((acc, p) => acc + (parseFloat(p.price.toString()) * p.stock), 0);
    const totalEarnings = orders.reduce((acc, o) => acc + parseFloat(o.total.toString()), 0);

    return {
      productCount,
      orderCount,
      totalValue,
      totalEarnings
    };
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return { productCount: 0, orderCount: 0, totalValue: 0, totalEarnings: 0 };
  }
}

export async function updateProduct(
  productId: string, 
  data: { 
    name: string; 
    price: number; 
    category: string; 
    team: string | null; 
    tag: string | null; 
    sizes: string[]; 
    description: string; 
    images: string[]; 
    stock?: number;
    isWorldCup?: boolean;
  }
) {
  try {
    await ensureAdmin();
    
    // Resolve short filenames to exact paths recursively on the server
    const resolvedImages = data.images
      .map((img: string) => resolveImageFilename(img))
      .filter(Boolean);

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        price: data.price,
        category: data.category,
        team: data.team || null,
        tag: data.tag || null,
        sizes: data.sizes,
        description: data.description,
        images: resolvedImages,
        stock: data.stock !== undefined ? data.stock : undefined,
        isWorldCup: data.isWorldCup !== undefined ? data.isWorldCup : undefined,
      },
    });
    return { success: true, product: { ...updatedProduct, price: updatedProduct.price.toString() } };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to save product changes" };
  }
}
