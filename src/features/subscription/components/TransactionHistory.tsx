import React from "react";
import { ArrowRight, Download } from "lucide-react";

export default function TransactionHistory() {
  const transactions = [
    {
      id: "INV-2026-05",
      date: "15/05/2026",
      plan: "Chuyên nghiệp (1 Tháng)",
      amount: "500.000",
      status: "Thành công",
    },
    {
      id: "INV-2026-04",
      date: "15/04/2026",
      plan: "Chuyên nghiệp (1 Tháng)",
      amount: "500.000",
      status: "Thành công",
    },
    {
      id: "INV-2026-03",
      date: "15/03/2026",
      plan: "Chuyên nghiệp (1 Tháng)",
      amount: "500.000",
      status: "Thành công",
    },
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-outline-variant bg-surface-container-low/40 flex justify-between items-center">
        <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
          Lịch sử giao dịch
        </h3>
        <button className="text-secondary hover:text-primary text-xs font-bold flex items-center gap-1 transition-colors active:translate-x-0.5 duration-150">
          <span>Xem tất cả</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-surface-container-low/20 border-b border-outline-variant">
              <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-36">
                Mã Đơn Hàng
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
              <th className="py-3 px-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((tx, idx) => (
              <tr
                key={idx}
                className="border-b border-outline-variant/30 hover:bg-surface-container-low/30 transition-colors group"
              >
                <td className="py-3.5 px-4 font-mono text-on-surface-variant text-xs font-semibold">
                  {tx.id}
                </td>
                <td className="py-3.5 px-4 font-mono text-on-surface-variant text-xs font-medium">
                  {tx.date}
                </td>
                <td className="py-3.5 px-4 font-semibold text-on-surface text-xs">
                  {tx.plan}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-on-surface-variant text-xs font-semibold">
                  {tx.amount}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                    {tx.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    className="text-on-surface-variant/80 hover:text-primary transition-colors p-1 rounded hover:bg-surface-container-low opacity-0 group-hover:opacity-100"
                    title="Tải hóa đơn"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
