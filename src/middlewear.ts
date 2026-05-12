import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define the routes that require an admin login
const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If someone tries to access the admin panel
  if (isProtectedRoute(req)) {
    // 1. Kick them to the login screen if they aren't logged in at all
    if (!userId) {
      return (await auth()).redirectToSignIn();
    }
    
    // 2. Kick them back to the homepage if their ID doesn't match the Admin
    // REPLACE THIS string with your actual Clerk User ID from your dashboard
    if (userId !== "user_3CDkW2DFMeDkehm2TFVxDwJYxdM") {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};