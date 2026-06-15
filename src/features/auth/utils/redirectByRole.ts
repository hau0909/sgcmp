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
      return "/registrations";

    case "guard":
      return "/guard";

    case "coordinator":
      return "/guards";

    default:
      return "/login";
  }
};
