import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// On définit quelles routes doivent être protégées
const isProtectedRoute = createRouteMatcher(['/']); 

export default clerkMiddleware(async (auth, req) => {
  // On appelle protect() directement sur le résultat de auth()
  if (isProtectedRoute(req)) {
    await auth.protect(); 
  }
});

export const config = {
  matcher: [
    // Ignore les fichiers statiques et les trucs internes de Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Toujours exécuter pour les routes API
    '/(api|trpc)(.*)',
  ],
};