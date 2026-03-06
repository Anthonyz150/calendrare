import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// On définit la route du calendrier comme protégée
const isProtectedRoute = createRouteMatcher(['/']); 

export default clerkMiddleware(async (auth, req) => {
  // On attend que auth() soit résolu avant d'appeler .protect()
  if (isProtectedRoute(req)) {
    const authObject = await auth();
    authObject.protect();
  }
});

export const config = {
  matcher: [
    // On ignore les fichiers statiques et les composants internes de Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // On force le middleware sur l'API et les routes trpc
    '/(api|trpc)(.*)',
  ],
};