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
import { Contract } from "../types";

// Re-importing sample contracts to lookup items
const SAMPLE_CONTRACTS: Contract[] = [
  {
    id: "1",
    contractCode: "HD-2026-001",
    customerName: "Công ty A",
    serviceName: "Cho thuê bảo vệ sự kiện",
    createdAt: "08/06/2026",
    status: "pending_hardcopy",
  },
  {
    id: "2",
    contractCode: "HD-2026-002",
    customerName: "Nguyễn Văn B",
    serviceName: "Bảo vệ mục tiêu cố định",
    createdAt: "05/06/2026",
    status: "pending_consent",
  },
  {
    id: "3",
    contractCode: "HD-2026-003",
    customerName: "Công ty C",
    serviceName: "Áp tải tiền",
    createdAt: "01/06/2026",
    status: "completed",
  },
  {
    id: "4",
    contractCode: "HD-2026-004",
    customerName: "Công ty TNHH Thương mại D",
    serviceName: "Bảo vệ yếu nhân (VIP)",
    createdAt: "30/05/2026",
    status: "completed",
  },
  {
    id: "5",
    contractCode: "HD-2026-005",
    customerName: "Nguyễn Văn E",
    serviceName: "Tuần tra canh gác ban đêm",
    createdAt: "28/05/2026",
    status: "pending_hardcopy",
  },
  {
    id: "6",
    contractCode: "HD-2026-006",
    customerName: "Công ty Cổ phần F",
    serviceName: "Cho thuê bảo vệ hội chợ triễn lãm",
    createdAt: "25/05/2026",
    status: "pending_consent",
  },
  {
    id: "7",
    contractCode: "HD-2026-007",
    customerName: "Công ty Xây dựng G",
    serviceName: "Bảo vệ công trường xây dựng",
    createdAt: "20/05/2026",
    status: "completed",
  },
  {
    id: "8",
    contractCode: "HD-2026-008",
    customerName: "Trần Thị H",
    serviceName: "Bảo vệ biệt thự nhà riêng",
    createdAt: "15/05/2026",
    status: "completed",
  },
  {
    id: "9",
    contractCode: "HD-2026-009",
    customerName: "Tập đoàn Bán lẻ I",
    serviceName: "Dịch vụ phản ứng nhanh & Giám sát an ninh",
    createdAt: "10/05/2026",
    status: "pending_hardcopy",
  },
  {
    id: "10",
    contractCode: "HD-2026-010",
    customerName: "Nguyễn Văn K",
    serviceName: "Áp tải tài liệu mật vận chuyển",
    createdAt: "05/05/2026",
    status: "completed",
  },
];

interface ContractDetailContainerProps {
  contractId: string;
}

export function ContractDetailContainer({ contractId }: ContractDetailContainerProps) {
  // Find base contract from sample list
  const baseContract = SAMPLE_CONTRACTS.find((c) => c.id === contractId);

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
    let duration = `${contract.createdAt} - 31/12/2026`;
    let location = "KCN Tân Bình, Tân Phú, TP. HCM";
    let totalValue = "450,000,000 VND";
    let paymentMethod = "Chuyển khoản ngân hàng";
    let docs = [
      {
        name: `HD_${contract.contractCode.replace(/-/g, "_")}_Signed.pdf`,
        size: "2.4 MB",
        uploadedTime: "Đã tải lên 2 giờ trước",
      },
    ];
    let historyList = [
      {
        time: "Hôm nay, 14:30",
        title:
          contract.status === "pending_hardcopy"
            ? "Chờ bản cứng"
            : contract.status === "pending_consent"
            ? "Chờ xác nhận đồng thuận"
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
    if (contract.id === "1") {
      phone = "0901 234 567";
      email = "contact@vinaguard.vn";
      address = "Tòa nhà Landmark 81, TP. HCM";
      quantity = 12;
      duration = "01/07/2026 - 31/12/2026";
      location = "KCN Tân Bình";
      totalValue = "450,000,000 VND";
      paymentMethod = "Chuyển khoản ngân hàng";
    } else if (contract.id === "2") {
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
          name: `HD_${contract.contractCode.replace(/-/g, "_")}_Draft.pdf`,
          size: "1.8 MB",
          uploadedTime: "Đã tải lên 1 ngày trước",
        },
      ];
    } else if (contract.id === "3") {
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
          name: `HD_${contract.contractCode.replace(/-/g, "_")}_Final.pdf`,
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
        contractCode={baseContract.contractCode}
        status={baseContract.status}
      />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Main Details & Documents) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Partner Info */}
          <ContractPartnerInfo
            customerName={baseContract.customerName}
            phone={detailedData.phone}
            email={detailedData.email}
            address={detailedData.address}
          />

          {/* Service & Payment Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContractServiceInfo
              serviceName={baseContract.serviceName}
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
