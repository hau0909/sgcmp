import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CompanySubscriptionCheckResult } from "@/features/subscription/types";
import { requestCheckSubscription } from "@/features/subscription/api/subscription.api";

type SubscriptionStore = CompanySubscriptionCheckResult & {
  isLoading: boolean;
  setSubscriptionStatus: (status: CompanySubscriptionCheckResult) => void;
  fetchSubscription: (companyId: string) => Promise<void>;
  clearSubscription: () => void;
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      hasSubscription: false,
      isActive: false,
      subscription: null,
      isLoading: true,

      setSubscriptionStatus: (status) =>
        set({
          hasSubscription: status.hasSubscription,
          isActive: status.isActive,
          subscription: status.subscription,
          isLoading: false,
        }),

      fetchSubscription: async (companyId) => {
        set({ isLoading: true });
        try {
          const result = await requestCheckSubscription(companyId);
          set({
            hasSubscription: result.hasSubscription,
            isActive: result.isActive,
            subscription: result.subscription,
            isLoading: false,
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
        }),
    }),
    {
      name: "sgcmp-subscription-store",
    }
  )
);
