export interface PaymentCalculationItem {
  payment_status: string;
  amount?: number | null;
}

export interface PaymentSummaryResult {
  totalRevenue: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
}

/**
 * Thuật toán tổng hợp doanh thu và đếm số lượng giao dịch theo trạng thái
 * @param payments Danh sách các bản ghi giao dịch thanh toán
 */
export function calculatePaymentSummary(
  payments: PaymentCalculationItem[]
): PaymentSummaryResult {
  let totalRevenue = 0;
  let successCount = 0;
  let pendingCount = 0;
  let failedCount = 0;

  for (const p of payments) {
    if (p.payment_status === "completed") {
      totalRevenue += p.amount || 0;
      successCount++;
    } else if (p.payment_status === "pending") {
      pendingCount++;
    } else if (p.payment_status === "failed") {
      failedCount++;
    }
  }

  return {
    totalRevenue,
    successCount,
    pendingCount,
    failedCount,
  };
}
