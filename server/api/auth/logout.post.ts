export default defineEventHandler((event) => {
  // Clear the JWT cookie used for manual login
  deleteCookie(event, "auth_token", {
    path: "/",
  });

  return { message: "Logged out" };
});
