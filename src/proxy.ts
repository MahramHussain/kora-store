import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";


const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/checkout(.*)',
  '/success(.*)'
]);

export default clerkMiddleware(async(auth, req) => {
  const path = req.nextUrl.pathname
  if (path.startsWith('/_next')||path.match(/\.(css|js|png|png|jpeg|jpg|svg|ico)$/) ){
    return
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
