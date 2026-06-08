export type UserRole =
  | "customer"
  | "admin"
  | "company-admin"
  | "guard"
  | "coordinator";

export const roleHomePath: Record<UserRole, string> = {
  customer: "/",
  admin: "/registrations",
  "company-admin": "/dashboard",
  guard: "/guard",

  /**
   * Nếu bạn có trang riêng cho coordinator thì đổi lại path này.
   * Ví dụ: "/coordinator-dashboard"
   */
  coordinator: "/coordinator",
};

export const protectedRoutes: Record<string, UserRole[]> = {
  /**
   * Admin routes
   */
  "/registrations": ["admin"],

  /**
   * Company admin routes
   * Vì trong company layout của bạn /coordinator là
   * "Quản lý điều phối viên", nên đang để company-admin.
   */
  "/dashboard": ["company-admin"],
  "/billing": ["company-admin"],
  "/coordinator": ["company-admin"],

  /**
   * Guard routes
   */
  "/guard": ["guard"],

  /**
   * Profile cho tất cả user đã login
   */
  "/profile": ["customer", "company-admin", "coordinator", "guard", "admin"],
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
