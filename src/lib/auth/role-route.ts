export type UserRole =
  | "customer"
  | "admin"
  | "company-admin"
  | "guard"
  | "Coordinator";

export const roleHomePath: Record<UserRole, string> = {
  customer: "/",
  admin: "/registrations",
  "company-admin": "/dashboard",
  guard: "/guard",
  Coordinator: "/contracts",
};

export const protectedRoutes: Record<string, UserRole[]> = {
  /**
   * Admin routes
   */
  "/registrations": ["admin"],

  /**
   * Company admin routes
   */
  "/dashboard": ["company-admin"],
  "/billing": ["company-admin"],
  "/coordinator": ["company-admin"],

  /**
   * Coordinator routes
   * Folder (Coordinator) không nằm trong URL.
   * URL thật là /contracts và /guards.
   */
  "/contracts": ["Coordinator"],
  "/guards": ["Coordinator"],

  /**
   * Guard routes
   */
  "/guard": ["guard"],

  /**
   * Profile cho tất cả user đã login
   */
  "/profile": ["customer", "company-admin", "Coordinator", "guard", "admin"],
};

export function getRedirectPathByRole(role: UserRole) {
  return roleHomePath[role] || "/";
}

export function getAllowedRolesByPath(pathname: string) {
  const matchedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route),
  );

  if (!matchedRoute) return null;

  return protectedRoutes[matchedRoute];
}
