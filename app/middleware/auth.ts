/**
 * Middleware to require authentication.
 * - Unauthenticated → /auth/login
 * - Authenticated → access granted
 */
export default defineNuxtRouteMiddleware(async () => {
  const user = await useCurrentUser();
  if (!user) return navigateTo("/auth/login");
});
