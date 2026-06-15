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
  Coordinator: "/guards",
};

export function getRedirectPathByRole(role: UserRole) {
  return roleHomePath[role] || "/";
}
