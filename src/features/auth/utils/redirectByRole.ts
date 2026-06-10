import type { UserRole } from "@/provider/authContext";

export const getRedirectPathByRole = (role: UserRole | string | null) => {
  switch (role?.toLowerCase()) {
    case "customer":
      return "/";

    case "company-admin":
      return "/dashboard";

    case "admin":
      return "/registrations";

    case "guard":
      return "/guard";

    case "coordinator":
      return "/contracts";

    default:
      return "/login";
  }
};
