import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/checkout(.*)',
  '/success(.*)'
]);

export default clerkMiddleware(async (auth, req) => {

  const path = req.nextUrl.pathname;
  if (path.startsWith('/_next') || path.match(/\.(css|js|png|jpg|jpeg|svg|ico|webp)$/)) {
    return; 
  }

  // 2. Protect the secure routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});