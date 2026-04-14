import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardUI from "./DashboardUI";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  // 1. Kick out anyone who isn't logged in
  if (!userId) {
    redirect("/account");
  }

  // 2. Format their real Clerk Profile Data
  const clerkUser = await currentUser();
  const joinYear = clerkUser?.createdAt ? new Date(clerkUser.createdAt).getFullYear().toString() : "2024";
  
  const safeUser = {
    name: clerkUser?.firstName || "Vault Member",
    email: clerkUser?.emailAddresses[0]?.emailAddress || "",
    imageUrl: clerkUser?.imageUrl,
    memberSince: joinYear.slice(-2), // Turns "2024" into "24" for your UI!
  };

  // 3. SECURE PRISMA FETCH: Pull their real orders!
  const rawOrders = await prisma.order.findMany({
    where: { userId: userId },
    include: {
      items: {
        include: {
          product: true 
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 4. Clean the Decimal types
  const safeOrders = rawOrders.map((order: any) => ({
    ...order,
    total: order.total.toString(),
    items: order.items.map((item: any) => ({
      ...item,
      price: item.price.toString(),
      product: {
        ...item.product,
        price: item.product.price.toString()
      }
    }))
  }));

  // 5. Send it all to your custom UI
  return <DashboardUI user={safeUser} orders={safeOrders} />;
}