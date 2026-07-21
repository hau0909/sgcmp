import { PaymentMethod } from "@/types/Enum";

export const validatePaymentPayload = (companyId: string, planId: number, paymentMethod: PaymentMethod) => {
  if (!companyId) throw new Error("Company ID is required");
  if (!planId) throw new Error("Plan ID is required");
  if (!paymentMethod) throw new Error("Payment method is required");
};

export const validateWebhookTransactionCode = (content: string) => {
  const match = content.toUpperCase().match(/TXN\d+/);
  if (!match) {
    return false;
  }
  return match[0];
};
