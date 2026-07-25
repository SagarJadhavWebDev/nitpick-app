import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/reports(.*)",
  "/api/waitlist(.*)",
  "/api/paddle/webhook(.*)",
  "/api/webhooks/clerk(.*)",
]);

import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  
  // Restrict sign-in and sign-up routes by redirecting to homepage
  if (url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
