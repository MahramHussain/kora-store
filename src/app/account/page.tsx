import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AccountUI from "./AccountUI";

export default async function AccountPage() {
  const { userId } = await auth();
  
  // 1. If they aren't logged in, show the custom Glowing Vault Lock login screen
  if (!userId) {
    return <AccountUI user={null} orders={[]} />;
  }

  // 2. If they are already logged in, redirect them to the premium multi-tab dashboard
  redirect("/account/dashboard");
}