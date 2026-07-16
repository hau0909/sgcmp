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
  coordinator: "/guards",
};

export function getRedirectPathByRole(role: UserRole) {
  return roleHomePath[role] || "/";
}
