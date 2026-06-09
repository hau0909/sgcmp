import { Payment } from "@/types/Payment";
import { Plan } from "@/types/Plan";

interface TransactionHistoryProps {
  payments: Payment[];
  plans: Plan[];
}

export default function TransactionHistory({
  payments,
  plans,
}: TransactionHistoryProps) {
  const getPlanName = (planId: number) => {
    const plan = plans.find((p) => p.plan_id === planId);
    return plan ? plan.plan_name : `Gói dịch vụ #${planId}`;
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-outline-variant bg-surface-container-low/40 flex justify-between">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
          Lịch sử giao dịch
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-surface-container-low/20 border-b border-outline-variant">
              <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-36">
                Mã Thanh Toán
              </th>
              <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-40">
                Mã Giao Dịch
              </th>
              <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-32">
                Ngày
              </th>
              <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Gói Dịch Vụ
              </th>
              <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right w-44">
                Số Tiền (VNĐ)
              </th>
              <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-36 text-center">
                Trạng Thái
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-on-surface-variant font-medium text-xs"
                >
                  Không có giao dịch nào
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                const planName = getPlanName(payment.plan_id);
                const formattedDate = new Date(
                  payment.paid_at || payment.created_at,
                ).toLocaleDateString("vi-VN");
                const formattedAmount = new Intl.NumberFormat("vi-VN").format(
                  payment.amount,
                );

                let statusLabel = "Chờ xử lý";
                let statusClass = "bg-amber-50 text-amber-700 border-amber-200";

                if (payment.payment_status === "completed") {
                  statusLabel = "Thành công";
                  statusClass =
                    "bg-emerald-50 text-emerald-700 border-emerald-200";
                } else if (payment.payment_status === "failed") {
                  statusLabel = "Thất bại";
                  statusClass = "bg-rose-50 text-rose-700 border-rose-200";
                } else if (payment.payment_status === "refunded") {
                  statusLabel = "Đã hoàn tiền";
                  statusClass = "bg-blue-50 text-blue-700 border-blue-200";
                }

                return (
                  <tr
                    key={payment.payment_id}
                    className="border-b border-outline-variant/30 hover:bg-surface-container-low/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono text-on-surface-variant text-xs font-semibold">
                      {payment.payment_id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-on-surface-variant text-xs font-medium">
                      {payment.transaction_code || "-"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-on-surface-variant text-xs font-medium">
                      {formattedDate}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-on-surface text-xs">
                      {planName}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-on-surface-variant text-xs font-semibold">
                      {formattedAmount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
