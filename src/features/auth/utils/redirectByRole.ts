import type { UserRole } from "@/provider/authContext";

export const getRedirectPathByRole = (role: UserRole | null) => {
  switch (role?.toLowerCase()) {
    case "customer":
      return "/";

    case "company-admin":
      return "/dashboard";

    case "admin":
      return "/admin";

    case "guard":
      return "/guard";

    case "Coordinator":
      return "/coor";

    default:
      return "/login";
  }
};
