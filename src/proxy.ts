import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/checkout(.*)',
  '/success(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  
  // Skip next internal routing and static files
  if (path.startsWith('/_next') || path.match(/\.(css|js|png|jpg|jpeg|svg|ico|webp)$/)) {
    return; 
  }

  // 1. Admin route protection (Strict checks for mahramh40@gmail.com and korastore.ae@gmail.com)
  if (isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return (await auth()).redirectToSignIn();
    }
    
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const email = user.emailAddresses[0]?.emailAddress;
      if (email !== "mahramh40@gmail.com" && email !== "korastore.ae@gmail.com") {
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (err) {
      console.error("Proxy Admin Verification Error:", err);
      return NextResponse.redirect(new URL('/', req.url));
    }
    return;
  }

  // 2. General protected routes (account, checkout, success)
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});