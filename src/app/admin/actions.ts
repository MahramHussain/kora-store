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
      where: {
        status: { not: "Pending" }
      },
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
      include: {
        sizeStocks: true,
        playerStocks: true
      }
    });
    
    return products.map(product => ({
      ...product,
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : null
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
      prisma.order.count({ where: { status: { not: "Pending" } } }),
      prisma.product.findMany({ select: { price: true, stock: true } }),
      prisma.order.findMany({ where: { status: { not: "Pending" } }, select: { total: true } })
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
    sizeStocks?: Record<string, number>;
    isWorldCup?: boolean;
    originalPrice: number | null;
    brand?: string | null;
    gender?: string | null;
    subCategory?: string | null;
    soleplate?: string | null;
    colorway?: string | null;
    playerStocks?: Array<{ name: string; number: string; stock: number }>;
  }
) {
  try {
    await ensureAdmin();
    
    // Resolve short filenames to exact paths recursively on the server
    const resolvedImages = data.images
      .map((img: string) => resolveImageFilename(img))
      .filter(Boolean);

    // Calculate total stock if sizeStocks is provided
    let totalStock = data.stock;
    if (data.sizeStocks && typeof data.sizeStocks === "object") {
      totalStock = Object.values(data.sizeStocks).reduce((acc: number, val: any) => acc + (parseInt(val as any) || 0), 0);
    }

    // Run updates in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete old sizeStocks
      if (data.sizeStocks && typeof data.sizeStocks === "object") {
        await tx.sizeStock.deleteMany({
          where: { productId }
        });
        
        // 2. Create new sizeStocks
        await tx.sizeStock.createMany({
          data: Object.entries(data.sizeStocks).map(([size, quantity]) => ({
            productId,
            size,
            quantity: parseInt(quantity as any) || 0
          }))
        });
      }

      // 2.5. Update playerStocks
      if (data.playerStocks && Array.isArray(data.playerStocks)) {
        await tx.playerStock.deleteMany({
          where: { productId }
        });
        
        await tx.playerStock.createMany({
          data: data.playerStocks.map((p) => ({
            productId,
            playerName: p.name.toUpperCase().trim(),
            playerNumber: p.number.trim(),
            quantity: parseInt(p.stock as any) || 0
          }))
        });
      }

      // 3. Update the product
      const updatedProduct = await tx.product.update({
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
          stock: totalStock !== undefined ? totalStock : undefined,
          isWorldCup: data.isWorldCup !== undefined ? data.isWorldCup : undefined,
          originalPrice: data.originalPrice,
          brand: data.brand || null,
          gender: data.gender || null,
          subCategory: data.subCategory || null,
          soleplate: data.soleplate || null,
          colorway: data.colorway || null,
        },
      });

      return updatedProduct;
    });

    return { success: true, product: { ...result, price: result.price.toString(), originalPrice: result.originalPrice ? result.originalPrice.toString() : null } };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to save product changes" };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await ensureAdmin();

    // 1. Delete associated order items due to foreign key constraints
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId }
    });

    // 2. Delete the order itself from the database
    await prisma.order.delete({
      where: { id: orderId }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete order from database:", error);
    return { success: false, error: "Failed to delete order from database" };
  }
}

export async function getUsers() {
  try {
    await ensureAdmin();
    const users = await prisma.user.findMany({
      include: {
        orders: {
          where: { status: { not: "Pending" } },
          orderBy: { createdAt: "desc" },
        },
        reviews: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((u) => {
      // Resolve phone and location from order history if not filled
      const resolvedPhone = u.phone || u.orders[0]?.shippingPhone || null;
      const resolvedLocation =
        u.location ||
        (u.orders[0]
          ? `${u.orders[0].shippingStreet || ""}, ${u.orders[0].shippingCity || ""}`.trim()
          : null);

      return {
        ...u,
        phone: resolvedPhone,
        location: resolvedLocation,
        createdAt: u.createdAt.toISOString(),
        bannedUntil: u.bannedUntil ? u.bannedUntil.toISOString() : null,
        shadowBanExpiresAt: u.shadowBanExpiresAt ? u.shadowBanExpiresAt.toISOString() : null,
        orders: u.orders.map((o) => ({
          ...o,
          total: o.total.toString(),
          createdAt: o.createdAt.toISOString(),
        })),
        reviews: u.reviews.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          adminReplyAt: r.adminReplyAt ? r.adminReplyAt.toISOString() : null,
        })),
      };
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function updateUserBanStatus(
  userId: string,
  data: {
    isBanned: boolean;
    bannedUntil: string | null;
    isShadowBanned: boolean;
    shadowBanExpiresAt: string | null;
  }
) {
  try {
    await ensureAdmin();
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: data.isBanned,
        bannedUntil: data.bannedUntil ? new Date(data.bannedUntil) : null,
        isShadowBanned: data.isShadowBanned,
        shadowBanExpiresAt: data.shadowBanExpiresAt ? new Date(data.shadowBanExpiresAt) : null,
      },
    });

    return {
      success: true,
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        bannedUntil: updatedUser.bannedUntil ? updatedUser.bannedUntil.toISOString() : null,
        shadowBanExpiresAt: updatedUser.shadowBanExpiresAt ? updatedUser.shadowBanExpiresAt.toISOString() : null,
      },
    };
  } catch (error) {
    console.error("Failed to update user ban status:", error);
    return { success: false, error: "Failed to update ban configuration" };
  }
}
