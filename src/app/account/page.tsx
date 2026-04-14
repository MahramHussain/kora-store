import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import AccountUI from "./AccountUI";

export default async function AccountPage() {
  const { userId } = await auth();
  
  // 1. If they aren't logged in, pass null so the UI shows your custom Glowing Vault Lock screen
  if (!userId) {
    return <AccountUI user={null} orders={[]} />;
  }

  // 2. Pull their Google/Clerk details
  const clerkUser = await currentUser();
  const safeUser = {
    firstName: clerkUser?.firstName,
    email: clerkUser?.emailAddresses[0]?.emailAddress,
    imageUrl: clerkUser?.imageUrl,
  };

  // 3. SECURE PRISMA FETCH: Pull only this specific user's orders!
  const rawOrders = await prisma.order.findMany({
    where: { userId: userId },
    include: {
      items: {
        include: {
          product: true // This is what grabs the tiny product images for the UI
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 4. Clean the database Decimal values so the Client UI can read them without crashing
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

  // 5. Hand the real data right to your custom Dashboard!
  return <AccountUI user={safeUser} orders={safeOrders} />;
}