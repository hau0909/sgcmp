export type UserRole =
  | "customer"
  | "admin"
  | "company-admin"
  | "guard"
  | "coordinator";

export const roleHomePath: Record<UserRole, string> = {
  customer: "/",
  admin: "/admin",
  "company-admin": "/dashboard",
  guard: "/overview",
  coordinator: "/guard-performance",
};

export function getRedirectPathByRole(role: UserRole) {
  return roleHomePath[role] || "/";
}
