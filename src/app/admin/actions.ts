"use server";

import { prisma } from "@/lib/prisma";

export async function getOrders() {
  try {
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

    // Next.js Server Actions typically need plain objects, returning it as is.
    // If Decimal serialization issues occur, we might need to map it to strings.
    // But let's hope it transfers smoothly or map Decimal to string.
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
    
    // Convert decimal to string to pass to Client Component safely
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
    // Attempt to delete it from the DB
    await prisma.product.delete({
      where: { id: productId },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    // If it's a foreign key constraint error from Prisma
    if (error.code === 'P2003') {
      return { success: false, error: "Cannot delete this product because it has already been ordered by customers. Archiving options must be used instead." };
    }
    return { success: false, error: "An unexpected error occurred while deleting." };
  }
}

export async function updateProduct(productId: string, data: { name: string, price: number, images: string[] }) {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        price: data.price,
        images: data.images
      },
    });
    return { success: true, product: { ...updatedProduct, price: updatedProduct.price.toString() } };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to save product changes" };
  }
}
