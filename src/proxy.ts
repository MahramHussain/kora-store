import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/checkout(.*)',
  '/success(.*)'
]);

export function proxy(req: any, event: any) {
  const isLocalhost = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1';
  const isProdKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_');

  if (isLocalhost && isProdKey) {
    console.warn("⚠️ [Clerk Warning] Using production keys on localhost. Clerk middleware bypassed to allow the page to load.");
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, req) => {
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
  })(req, event);
}