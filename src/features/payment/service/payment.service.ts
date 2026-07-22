import { Payment } from "@/types/Payment";
import { BankAccount } from "@/types/BankAccount";
import { PaymentMethod, PaymentStatus } from "@/types/Enum";
import {
  getPaymentHistoryByCompany,
  createPayment,
  getPaymentById,
  updatePaymentStatus,
  getPaymentByTransactionCode,
  getAllBankAccounts,
  getBankAccountById,
  getActiveBankAccount,
  insertBankAccount,
  updateBankAccount,
  activateBankAccount,
  deactivateAllBankAccounts,
  deactivateBankAccount,
  countBankAccounts,
  deleteBankAccount,
  getAllPaymentsAdmin,
  getPaymentSummaryAdmin,
} from "../repository/payment.repository";
import {
  UpsertBankAccountPayload,
  GetAllPaymentsAdminOptions,
  PaginatedPayments,
  PaymentWithCompany,
  PaymentSummaryAdminOptions,
  PaymentSummaryAdminResult,
} from "../types";
import {
  createSubscription,
  activateSubscription,
  deactivateCompanySubscriptions,
} from "../../subscription/repository/subscription.repository";
import { getPlanByIdService } from "../../subscription/service/subscription.service";
import { validatePaymentPayload, validateWebhookTransactionCode } from "../validator/payment.validator";

export const getPaymentHistoryService = async (
  companyId: string,
  limit: number,
  status: PaymentStatus,
): Promise<Payment[]> => {
  if (!companyId) {
    throw new Error("Company ID is required");
  }

  const result = await getPaymentHistoryByCompany(companyId, limit, status);
  return result;
};

export const createPaymentService = async (
  companyId: string,
  planId: number,
  paymentMethod: PaymentMethod,
): Promise<Payment> => {
  validatePaymentPayload(companyId, planId, paymentMethod);

  // Fetch plan details to verify and get duration/price
  const plan = await getPlanByIdService(planId);
  if (!plan) {
    throw new Error(`Plan with ID ${planId} not found`);
  }

  // Calculate start/end dates for the subscription
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + plan.duration_days);

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  // 1. Create a subscription record in 'unactive' status first
  const subscription = await createSubscription({
    company_id: companyId,
    plan_id: planId,
    start_date: startDateStr,
    end_date: endDateStr,
    status: "unactive",
    auto_renew: true,
  });

  if (!subscription) {
    throw new Error("Failed to create subscription record");
  }

  // 2. Generate unique transaction code
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const transactionCode = `TXN${timestamp}${randomSuffix}`;

  // 3. Create the payment record in 'pending' status
  const payment = await createPayment({
    subscription_id: subscription.subscription_id,
    company_id: companyId,
    plan_id: planId,
    amount: plan.price,
    payment_method: paymentMethod,
    payment_status: "pending",
    transaction_code: transactionCode,
    paid_at: null,
  });

  return payment;
};

export const updatePaymentStatusService = async (
  paymentId: string,
  status: PaymentStatus,
): Promise<Payment> => {
  if (!paymentId) throw new Error("Payment ID is required");
  if (!status) throw new Error("Status is required");

  // 1. Fetch current payment details
  const payment = await getPaymentById(paymentId);
  if (!payment) {
    throw new Error(`Payment with ID ${paymentId} not found`);
  }

  // If status is the same, no action needed, return
  if (payment.payment_status === status) {
    return payment;
  }

  let updatedPayment: Payment;

  if (status === "completed") {
    const paidAt = new Date().toISOString();

    // 2. Update payment status to completed
    updatedPayment = await updatePaymentStatus(paymentId, "completed", paidAt);

    // 3. Get plan duration_days
    const plan = await getPlanByIdService(payment.plan_id);
    if (!plan) {
      throw new Error(`Plan with ID ${payment.plan_id} not found`);
    }

    // 4. Calculate active dates starting from today
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration_days);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // 5. Deactivate other active subscriptions for this company
    await deactivateCompanySubscriptions(payment.company_id, payment.subscription_id);

    // 6. Activate the new subscription
    await activateSubscription(payment.subscription_id, startDateStr, endDateStr);
  } else {
    // For failed, refunded, or pending status update
    updatedPayment = await updatePaymentStatus(paymentId, status, null);
  }

  return updatedPayment;
};

export const getPaymentByIdService = async (paymentId: string): Promise<Payment | null> => {
  if (!paymentId) throw new Error("Payment ID is required");
  const payment = await getPaymentById(paymentId);
  return payment;
};

export const handleSePayWebhookService = async (payload: any): Promise<boolean> => {
  const { transferAmount, content } = payload;
  if (!content) return false;

  const transactionCode = validateWebhookTransactionCode(content);
  if (!transactionCode) {
    console.log("No transaction code found in content:", content);
    return false;
  }
  const payment = await getPaymentByTransactionCode(transactionCode);

  if (!payment) {
    console.log("Payment not found for transaction code:", transactionCode);
    return false;
  }

  if (payment.payment_status === "pending" && transferAmount >= payment.amount) {
    await updatePaymentStatusService(payment.payment_id, "completed");
    return true;
  }

  console.log(`Webhook condition not met. Transfer: ${transferAmount}, Expected: ${payment.amount}, Status: ${payment.payment_status}`);
  return false;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAllPaymentsAdminService = async (): Promise<PaymentWithCompany[]> => {
  return await getAllPaymentsAdmin();
};

export const getPaymentSummaryAdminService = async (
  options: PaymentSummaryAdminOptions = {},
): Promise<PaymentSummaryAdminResult> => {
  return await getPaymentSummaryAdmin(options);
};

export {
  type GetAllPaymentsAdminOptions,
  type PaginatedPayments,
  type PaymentWithCompany,
  type PaymentSummaryAdminOptions,
  type PaymentSummaryAdminResult,
};

// ─── Bank Account ────────────────────────────────────────────────────────────

export const getAllBankAccountsService = async (): Promise<BankAccount[]> => {
  return await getAllBankAccounts();
};

export const getActiveBankAccountService =
  async (): Promise<BankAccount | null> => {
    return await getActiveBankAccount();
  };

export const createBankAccountService = async (
  payload: UpsertBankAccountPayload,
): Promise<BankAccount> => {
  if (!payload.bank_code) throw new Error("Bank code is required");
  if (!payload.bank_name) throw new Error("Bank name is required");
  if (!payload.account_number) throw new Error("Account number is required");
  if (!payload.account_name) throw new Error("Account name is required");

  return await insertBankAccount(payload);
};

export const updateBankAccountService = async (
  id: string,
  payload: UpsertBankAccountPayload,
): Promise<BankAccount> => {
  if (!id) throw new Error("Bank account ID is required");
  if (!payload.bank_code) throw new Error("Bank code is required");
  if (!payload.bank_name) throw new Error("Bank name is required");
  if (!payload.account_number) throw new Error("Account number is required");
  if (!payload.account_name) throw new Error("Account name is required");

  const existing = await getBankAccountById(id);
  if (!existing) throw new Error(`Bank account with ID ${id} not found`);

  return await updateBankAccount(id, payload);
};

export const switchActiveBankAccountService = async (
  id: string,
): Promise<BankAccount> => {
  if (!id) throw new Error("Bank account ID is required");

  const existing = await getBankAccountById(id);
  if (!existing) throw new Error(`Bank account with ID ${id} not found`);

  // Deactivate all, then activate the target
  await deactivateAllBankAccounts();
  return await activateBankAccount(id);
};

export const deactivateBankAccountService = async (id: string): Promise<void> => {
  if (!id) throw new Error("Bank account ID is required");

  const existing = await getBankAccountById(id);
  if (!existing) throw new Error(`Bank account with ID ${id} not found`);

  await deactivateBankAccount(id);
};

export const deleteBankAccountService = async (id: string): Promise<void> => {
  if (!id) throw new Error("Bank account ID is required");

  const existing = await getBankAccountById(id);
  if (!existing) throw new Error(`Bank account with ID ${id} not found`);

  // Business rule: must keep at least 1 account
  const total = await countBankAccounts();
  if (total <= 1) {
    throw new Error("Không thể xóa tài khoản cuối cùng. Hệ thống phải có ít nhất 1 tài khoản ngân hàng.");
  }

  await deleteBankAccount(id);
};
