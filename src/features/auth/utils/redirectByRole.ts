import { UserRole } from "@/types/Enum";

export const getRedirectPathByRole = (
  role: UserRole | string | null | undefined,
) => {
  switch (role?.toLowerCase()) {
    case "customer":
      return "/";

    case "company-admin":
      return "/dashboard";

    case "admin":
      return "/admin";

    case "guard":
      return "/overview";

    case "coordinator":
      return "/schedules";

    default:
      return "/login";
  }
};
