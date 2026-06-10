"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { ContractDetailHeader } from "./ContractDetailHeader";
import { ContractPartnerInfo } from "./ContractPartnerInfo";
import { ContractServiceInfo } from "./ContractServiceInfo";
import { ContractPaymentInfo } from "./ContractPaymentInfo";
import { ContractDocuments } from "./ContractDocuments";
import { ContractHistoryLog } from "./ContractHistoryLog";
import { Contract } from "@/types/Contract";

// Re-importing sample contracts using snake_case properties to match global Contract type
const SAMPLE_CONTRACTS: Contract[] = [
  {
    contract_id: "1",
    booking_id: "b1",
    contract_file_url: null,
    customer_agreed: false,
    company_agreed: false,
    start_date: "2026-07-01",
    end_date: "2026-12-31",
    contract_code: "HD-2026-001",
    customer_name: "Công ty A",
    service_name: "Cho thuê bảo vệ sự kiện",
    created_at: "2026-06-08T00:00:00Z",
    updated_at: "2026-06-08T00:00:00Z",
    status: "pending_signatures",
  },
  {
    contract_id: "2",
    booking_id: "b2",
    contract_file_url: null,
    customer_agreed: false,
    company_agreed: false,
    start_date: "2026-06-15",
    end_date: "2026-12-15",
    contract_code: "HD-2026-002",
    customer_name: "Nguyễn Văn B",
    service_name: "Bảo vệ mục tiêu cố định",
    created_at: "2026-06-05T00:00:00Z",
    updated_at: "2026-06-05T00:00:00Z",
    status: "active",
  },
  {
    contract_id: "3",
    booking_id: "b3",
    contract_file_url: null,
    customer_agreed: true,
    company_agreed: true,
    start_date: "2026-06-01",
    end_date: "2027-06-01",
    contract_code: "HD-2026-003",
    customer_name: "Công ty C",
    service_name: "Áp tải tiền",
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
    status: "completed",
  },
  {
    contract_id: "4",
    booking_id: "b4",
    contract_file_url: null,
    customer_agreed: true,
    company_agreed: true,
    start_date: "2026-05-30",
    end_date: "2026-11-30",
    contract_code: "HD-2026-004",
    customer_name: "Công ty TNHH Thương mại D",
    service_name: "Bảo vệ yếu nhân (VIP)",
    created_at: "2026-05-30T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
    status: "completed",
  },
  {
    contract_id: "5",
    booking_id: "b5",
    contract_file_url: null,
    customer_agreed: false,
    company_agreed: false,
    start_date: "2026-05-28",
    end_date: "2026-11-28",
    contract_code: "HD-2026-005",
    customer_name: "Nguyễn Văn E",
    service_name: "Tuần tra canh gác ban đêm",
    created_at: "2026-05-28T00:00:00Z",
    updated_at: "2026-05-28T00:00:00Z",
    status: "pending_signatures",
  },
  {
    contract_id: "6",
    booking_id: "b6",
    contract_file_url: null,
    customer_agreed: false,
    company_agreed: false,
    start_date: "2026-05-25",
    end_date: "2026-11-25",
    contract_code: "HD-2026-006",
    customer_name: "Công ty Cổ phần F",
    service_name: "Cho thuê bảo vệ hội chợ triễn lãm",
    created_at: "2026-05-25T00:00:00Z",
    updated_at: "2026-05-25T00:00:00Z",
    status: "active",
  },
  {
    contract_id: "7",
    booking_id: "b7",
    contract_file_url: null,
    customer_agreed: true,
    company_agreed: true,
    start_date: "2026-05-20",
    end_date: "2026-11-20",
    contract_code: "HD-2026-007",
    customer_name: "Công ty Xây dựng G",
    service_name: "Bảo vệ công trường xây dựng",
    created_at: "2026-05-20T00:00:00Z",
    updated_at: "2026-05-20T00:00:00Z",
    status: "completed",
  },
  {
    contract_id: "8",
    booking_id: "b8",
    contract_file_url: null,
    customer_agreed: true,
    company_agreed: true,
    start_date: "2026-05-15",
    end_date: "2026-11-15",
    contract_code: "HD-2026-008",
    customer_name: "Trần Thị H",
    service_name: "Bảo vệ biệt thự nhà riêng",
    created_at: "2026-05-15T00:00:00Z",
    updated_at: "2026-05-15T00:00:00Z",
    status: "completed",
  },
  {
    contract_id: "9",
    booking_id: "b9",
    contract_file_url: null,
    customer_agreed: false,
    company_agreed: false,
    start_date: "2026-05-10",
    end_date: "2026-11-10",
    contract_code: "HD-2026-009",
    customer_name: "Tập đoàn Bán lẻ I",
    service_name: "Dịch vụ phản ứng nhanh & Giám sát an ninh",
    created_at: "2026-05-10T00:00:00Z",
    updated_at: "2026-05-10T00:00:00Z",
    status: "pending_signatures",
  },
  {
    contract_id: "10",
    booking_id: "b10",
    contract_file_url: null,
    customer_agreed: true,
    company_agreed: true,
    start_date: "2026-05-05",
    end_date: "2026-11-05",
    contract_code: "HD-2026-010",
    customer_name: "Nguyễn Văn K",
    service_name: "Áp tải tài liệu mật vận chuyển",
    created_at: "2026-05-05T00:00:00Z",
    updated_at: "2026-05-05T00:00:00Z",
    status: "completed",
  },
];

interface ContractDetailContainerProps {
  contractId: string;
}

export function ContractDetailContainer({ contractId }: ContractDetailContainerProps) {
  // Find base contract from sample list
  const baseContract = SAMPLE_CONTRACTS.find((c) => c.contract_id === contractId);

  if (!baseContract) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/40">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-2 font-headline">
          Hợp đồng không tồn tại
        </h3>
        <p className="text-sm text-on-surface-variant max-w-xs mb-6 font-body">
          Rất tiếc, chúng tôi không tìm thấy thông tin hợp đồng với mã định danh được yêu cầu.
        </p>
        <Link
          href="/contracts"
          className="bg-primary hover:bg-primary/95 text-on-primary font-semibold px-4 py-2 rounded-lg text-sm transition-transform active:scale-95 duration-100 flex items-center gap-1.5 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>
    );
  }

  // Generate detailed parameters based on contract ID
  const getDetailedData = (contract: Contract) => {
    // Shared defaults
    let phone = "0901 234 567";
    let email = "contact@vinaguard.vn";
    let address = "Tòa nhà Landmark 81, Bình Thạnh, TP. HCM";
    let quantity = 10;
    
    // Format created date
    const formattedCreatedDate = contract.created_at
      ? new Date(contract.created_at).toLocaleDateString("vi-VN")
      : "";
    let duration = `${formattedCreatedDate} - 31/12/2026`;
    let location = "KCN Tân Bình, Tân Phú, TP. HCM";
    let totalValue = "450,000,000 VND";
    let paymentMethod = "Chuyển khoản ngân hàng";
    let docs = [
      {
        name: `HD_${(contract.contract_code || "").replace(/-/g, "_")}_Signed.pdf`,
        size: "2.4 MB",
        uploadedTime: "Đã tải lên 2 giờ trước",
      },
    ];
    let historyList = [
      {
        time: "Hôm nay, 14:30",
        title:
          contract.status === "pending_signatures"
            ? "Chờ chữ ký"
            : contract.status === "active"
            ? "Đang hoạt động"
            : "Đã hoàn thành",
        description: "Trạng thái được cập nhật bởi Hệ thống",
        isLatest: true,
      },
      {
        time: "Hôm nay, 10:15",
        title: "Hợp đồng đã tải lên",
        description: "Người thực hiện: Nguyễn Văn A",
      },
      {
        time: "Hôm qua, 16:45",
        title: "Báo giá đã gửi",
        description: `Gửi tới ${email}`,
      },
      {
        time: "12/06/2026, 09:00",
        title: "Khảo sát hoàn tất",
        description: "Biên bản khảo sát đã được duyệt",
      },
    ];

    // Specific overrides for first few IDs to match details perfectly
    if (contract.contract_id === "1") {
      phone = "0901 234 567";
      email = "contact@vinaguard.vn";
      address = "Tòa nhà Landmark 81, TP. HCM";
      quantity = 12;
      duration = "01/07/2026 - 31/12/2026";
      location = "KCN Tân Bình";
      totalValue = "450,000,000 VND";
      paymentMethod = "Chuyển khoản ngân hàng";
    } else if (contract.contract_id === "2") {
      phone = "0912 345 678";
      email = "nguyenvanb@gmail.com";
      address = "Biệt thự Mỹ Thái, Phú Mỹ Hưng, Quận 7, TP. HCM";
      quantity = 4;
      duration = "15/06/2026 - 15/12/2026";
      location = "Khu đô thị Phú Mỹ Hưng, Quận 7";
      totalValue = "180,000,000 VND";
      paymentMethod = "Thanh toán qua cổng thẻ (Visa/Mastercard)";
      docs = [
        {
          name: `HD_${(contract.contract_code || "").replace(/-/g, "_")}_Draft.pdf`,
          size: "1.8 MB",
          uploadedTime: "Đã tải lên 1 ngày trước",
        },
      ];
    } else if (contract.contract_id === "3") {
      phone = "028 3930 1234";
      email = "security@techcom.com.vn";
      address = "Tòa nhà Techcom Tower, Quận 1, TP. HCM";
      quantity = 8;
      duration = "01/06/2026 - 01/06/2027";
      location = "Các chi nhánh Techcombank tại TP. HCM";
      totalValue = "920,000,000 VND";
      paymentMethod = "Chuyển khoản ngân hàng";
      docs = [
        {
          name: `HD_${(contract.contract_code || "").replace(/-/g, "_")}_Final.pdf`,
          size: "3.1 MB",
          uploadedTime: "Đã tải lên 5 ngày trước",
        },
      ];
    }

    return {
      phone,
      email,
      address,
      quantity,
      duration,
      location,
      totalValue,
      paymentMethod,
      docs,
      historyList,
    };
  };

  const detailedData = getDetailedData(baseContract);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full space-y-6">
      {/* Contract Page Header */}
      <ContractDetailHeader
        contractCode={baseContract.contract_code || ""}
        status={baseContract.status}
      />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Main Details & Documents) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Partner Info */}
          <ContractPartnerInfo
            customerName={baseContract.customer_name || ""}
            phone={detailedData.phone}
            email={detailedData.email}
            address={detailedData.address}
          />

          {/* Service & Payment Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContractServiceInfo
              serviceName={baseContract.service_name || ""}
              quantity={detailedData.quantity}
              duration={detailedData.duration}
              location={detailedData.location}
            />

            <ContractPaymentInfo
              totalValue={detailedData.totalValue}
              paymentMethod={detailedData.paymentMethod}
            />
          </div>

          {/* Contract Documents */}
          <ContractDocuments documents={detailedData.docs} />
        </div>

        {/* Right Column (Change History Log) */}
        <div className="xl:col-span-1">
          <ContractHistoryLog history={detailedData.historyList} />
        </div>
      </div>
    </div>
  );
}
