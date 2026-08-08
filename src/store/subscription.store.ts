import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CompanySubscriptionCheckResult } from "@/features/subscription/types";
import { requestCheckSubscription } from "@/features/subscription/api/subscription.api";

type SubscriptionStore = CompanySubscriptionCheckResult & {
  isLoading: boolean;
  /** ID công ty đã được fetch lần cuối — dùng để tránh flash khi re-mount */
  lastFetchedCompanyId: string | null;
  setSubscriptionStatus: (status: CompanySubscriptionCheckResult) => void;
  /**
   * Fetch subscription.
   * - silent=true: không reset isLoading (dùng khi đã có data cũ của cùng company)
   * - silent=false (mặc định): reset isLoading=true trước khi fetch
   */
  fetchSubscription: (companyId: string, silent?: boolean) => Promise<void>;
  clearSubscription: () => void;
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      hasSubscription: false,
      isActive: false,
      subscription: null,
      isLoading: true,
      lastFetchedCompanyId: null,

      setSubscriptionStatus: (status) =>
        set({
          hasSubscription: status.hasSubscription,
          isActive: status.isActive,
          subscription: status.subscription,
          isLoading: false,
        }),

      fetchSubscription: async (companyId, silent = false) => {
        if (!silent) {
          set({ isLoading: true });
        }
        try {
          const result = await requestCheckSubscription(companyId);
          set({
            hasSubscription: result.hasSubscription,
            isActive: result.isActive,
            subscription: result.subscription,
            isLoading: false,
            lastFetchedCompanyId: companyId,
          });
        } catch (error) {
          console.error("Lỗi khi đồng bộ gói dịch vụ:", error);
          set({ isLoading: false });
        }
      },

      clearSubscription: () =>
        set({
          hasSubscription: false,
          isActive: false,
          subscription: null,
          isLoading: false,
          lastFetchedCompanyId: null,
        }),
    }),
    {
      name: "sgcmp-subscription-store",
    }
  )
);
