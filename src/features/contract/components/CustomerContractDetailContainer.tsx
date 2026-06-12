"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  X,
  AlertTriangle,
  PenLine,
} from "lucide-react";
import { CustomerContractDetailHeader } from "./CustomerContractDetailHeader";
import { CustomerCompanyInfo } from "./CustomerCompanyInfo";
import { CustomerServiceInfo } from "./CustomerServiceInfo";
import { CustomerPaymentInfo } from "./CustomerPaymentInfo";
import { CustomerContractDocument } from "./CustomerContractDocument";
import { CustomerHistoryLog } from "./CustomerHistoryLog";

type ContractStatus = "pending_signatures" | "active" | "completed" | "cancelled";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CONTRACT = {
  contract_id: "mock-001",
  contract_code: "HD-A1B2C3D4",
  status: "pending_signatures" as ContractStatus,
  customer_agreed: false,
  company_agreed: true,
  created_at: "2026-06-10T09:00:00Z",
  updated_at: "2026-06-11T14:30:00Z",
  start_date: "2026-07-01",
  end_date: "2026-12-31",
  contract_file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // Mock PDF url to display file ui

  // Company info
  company: {
    name: "Công ty TNHH Bảo vệ An Toàn Việt",
    phone: "028 3823 4567",
    email: "contact@antoanviet.vn",
    address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  },

  // Service info
  service_name: "Bảo vệ chuyên nghiệp 24/7",
  guards_per_slot: 3,
  duration: "01/07/2026 - 31/12/2026",
  location: "456 Lê Lợi, Quận 3, TP. Hồ Chí Minh",
  time_slots: ["06:00 - 14:00", "14:00 - 22:00", "22:00 - 06:00"],
  description: "Yêu cầu bảo vệ mặc đồng phục, xuất trình thẻ nhân viên khi nhận ca. Liên hệ trưởng ca trước 30 phút.",
  formatted_price: "180.000.000 ₫",
};

const MOCK_HISTORY = [
  {
    time: "12/06/2026 09:45",
    title: "Công ty đã ký duyệt",
    description: "Người thực hiện: Đại diện công ty cung cấp dịch vụ",
    isLatest: true,
  },
  {
    time: "11/06/2026 16:00",
    title: "Chờ chữ ký",
    description: "Báo giá được chấp nhận, hệ thống chuyển sang trạng thái chờ ký kết",
  },
  {
    time: "10/06/2026 09:00",
    title: "Dự thảo hợp đồng được tạo",
    description: "Tài liệu hợp đồng nháp được tạo tự động bởi hệ thống",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface CustomerContractDetailContainerProps {
  contractId: string;
}

export function CustomerContractDetailContainer({
  contractId: _contractId,
}: CustomerContractDetailContainerProps) {
  const [contract, setContract] = useState(MOCK_CONTRACT);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState(MOCK_HISTORY);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const handleSignCustomer = () => {
    setIsSignModalOpen(false);

    const now = new Date().toLocaleString("vi-VN");
    const newStatus =
      contract.company_agreed ? "active" : contract.status;

    setContract((prev) => ({
      ...prev,
      customer_agreed: true,
      status: newStatus,
    }));

    setHistory((prev) => [
      {
        time: now,
        title: "Bạn đã ký xác nhận",
        description: "Người thực hiện: Khách hàng (bạn)",
        isLatest: true,
      },
      ...prev.map((h) => ({ ...h, isLatest: false })),
    ]);

    showToast(
      newStatus === "active"
        ? "Ký xác nhận thành công! Hợp đồng đã chính thức có hiệu lực."
        : "Ký xác nhận thành công! Đang chờ công ty hoàn tất ký kết."
    );
  };

  const isPendingAndCustomerNotSigned =
    contract.status === "pending_signatures" && !contract.customer_agreed;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast(null)} className="text-white/60 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <CustomerContractDetailHeader
        contractCode={contract.contract_code}
        status={contract.status}
        customerAgreed={contract.customer_agreed}
        companyAgreed={contract.company_agreed}
        contractFileUrl={contract.contract_file_url}
        onSignCustomer={() => setIsSignModalOpen(true)}
      />

      {/* Pending banner */}
      {isPendingAndCustomerNotSigned && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Hợp đồng đang chờ xác nhận của bạn</p>
            <p className="text-xs leading-relaxed text-amber-700">
              {contract.contract_file_url
                ? 'Vui lòng xem tài liệu hợp đồng và nhấn "Ký xác nhận" khi bạn đã đồng ý với các điều khoản.'
                : "Tài liệu hợp đồng PDF đang được chuẩn bị. Bạn sẽ có thể ký sau khi tệp được tải lên."}
            </p>
          </div>
        </div>
      )}

      {/* Bento Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Company info */}
          <CustomerCompanyInfo
            companyName={contract.company.name}
            phone={contract.company.phone}
            email={contract.company.email}
            address={contract.company.address}
          />

          {/* Service + Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomerServiceInfo
              serviceName={contract.service_name}
              quantity={contract.guards_per_slot}
              duration={contract.duration}
              location={contract.location}
              timeSlots={contract.time_slots}
              description={contract.description}
            />
            <CustomerPaymentInfo totalValue={contract.formatted_price} />
          </div>

          {/* Document (read-only) */}
          <CustomerContractDocument
            contractFileUrl={contract.contract_file_url}
            contractCode={contract.contract_code}
          />
        </div>

        {/* Right column */}
        <div className="xl:col-span-1">
          <CustomerHistoryLog history={history} />
        </div>
      </div>

      {/* Sign Confirmation Modal */}
      {isSignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#c3c6d3] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="bg-[#eff4ff] border-b border-[#acc7ff] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#024594]">
                <PenLine className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">
                  Xác nhận ký hợp đồng
                </h3>
              </div>
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-3 font-body">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Bạn có chắc chắn muốn ký xác nhận hợp đồng{" "}
                <span className="font-bold text-[#0b1c30]">
                  #{contract.contract_code}
                </span>{" "}
                không?
              </p>
              <p className="text-xs text-[#b45309] bg-[#fffbeb] border border-[#fde68a] p-3 rounded-lg leading-normal flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#d97706] mt-0.5" />
                Lưu ý: Hành động này xác nhận bạn đồng ý với toàn bộ các điều
                khoản và điều kiện trong hợp đồng dịch vụ bảo vệ này. Hành
                động không thể hoàn tác.
              </p>
            </div>

            {/* Modal footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded text-sm font-semibold text-slate-700 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSignCustomer}
                className="px-4 py-2 bg-[#024594] hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md cursor-pointer"
              >
                Đồng ý ký kết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
