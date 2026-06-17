import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@/types/Enum";

type AuthStore = {
  user_id: string | null;
  role: UserRole | null;
  company_id: string | null;

  setAuth: (data: {
    user_id: string;
    role: UserRole;
    company_id: string | null;
  }) => void;

  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user_id: null,
      role: null,
      company_id: null,

      setAuth: ({ user_id, role, company_id }) =>
        set({
          user_id,
          role,
          company_id,
        }),

      clearAuth: () =>
        set({
          user_id: null,
          role: null,
          company_id: null,
        }),
    }),
    {
      name: "sgcmp-auth-store",
    },
  ),
);
