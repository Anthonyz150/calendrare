import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// On définit quelles routes sont publiques (tout le monde peut voir)
// Ici, on veut que TOUT soit protégé sauf la page de connexion
const isProtectedRoute = createRouteMatcher(['/']); 

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};