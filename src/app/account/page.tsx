import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AccountUI from "./AccountUI";

import { prisma } from "@/lib/prisma";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ banned?: string }> }) {
  const { userId } = await auth();
  const { banned } = await searchParams;
  
  // 1. If they aren't logged in, show the custom Glowing Vault Lock login screen
  if (!userId) {
    return <AccountUI user={null} orders={[]} banned={banned === "true"} />;
  }

  // 2. Check if logged-in user is banned/restricted
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (dbUser) {
    const isBanned = dbUser.isBanned || (dbUser.bannedUntil && new Date() < new Date(dbUser.bannedUntil));
    const isShadowBanned = dbUser.isShadowBanned && (!dbUser.shadowBanExpiresAt || new Date() < new Date(dbUser.shadowBanExpiresAt));
    if (isBanned || isShadowBanned) {
      return <AccountUI user={dbUser} orders={[]} banned={true} />;
    }
  }

  // 3. If they are already logged in, redirect them to the premium multi-tab dashboard
  redirect("/account/dashboard");
}