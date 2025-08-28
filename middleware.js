import {
  clerkMiddleware,
  createRouteMatcher,

} from "@clerk/nextjs/server";
// import { getOrgId } from "./lib/db/org";
// import { validateOrgAccess } from "./lib/db/validations";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api(.*)",
  "/onboarding(.*)",
  "/invitee(.*)",
  "/sign-in(.*)",
  "/waitlist(.*)",
  "/public(.*)",
  "/thank-you(.*)",
  "get-started(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return;
  }

  // // Clerk auth check (auto-handled by `auth.protect`)
  // const { userId: clerkId } = await auth();
  // if (!clerkId) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  // // Org check (your custom logic)
  // const orgId = await getOrgId(clerkId);
  // if (!orgId) {
  //   return new Response("Organization required", { status: 403 });
  // }

  // // Org access validation
  // try {
  //   await validateOrgAccess(clerkId, orgId);
  // } catch {
  //   return new Response("Access denied", { status: 403 });
  // }

  // Protect all other routes, redirecting unauthenticated users to the root
  await auth.protect({
    unauthenticatedUrl: new URL("/sign-in", req.url).toString(), // Constructs absolute URL dynamically
  });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
