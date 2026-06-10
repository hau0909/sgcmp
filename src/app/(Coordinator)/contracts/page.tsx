"use client";

import React, { useState, useMemo } from "react";
import { Contract } from "@/features/contract/types";
import { ContractHeader } from "@/features/contract/components/ContractHeader";
import { ContractFilters } from "@/features/contract/components/ContractFilters";
import { ContractTable } from "@/features/contract/components/ContractTable";

// Rich sample data representing security service contracts
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

// Helper to convert "DD/MM/YYYY" into a comparable Date object
function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

export default function ContractsPage() {
  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 5; // Set to 5 so we can showcase page switches on 10 sample items

  // Client-side filtering logic
  const filteredContracts = useMemo(() => {
    return SAMPLE_CONTRACTS.filter((contract) => {
      // 1. Search term match
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        const codeMatch = contract.contractCode.toLowerCase().includes(query);
        const customerMatch = contract.customerName.toLowerCase().includes(query);
        const serviceMatch = contract.serviceName.toLowerCase().includes(query);
        if (!codeMatch && !customerMatch && !serviceMatch) {
          return false;
        }
      }

      // 2. Status match
      if (status !== "" && contract.status !== status) {
        return false;
      }

      // 3. Date bounds match
      const contractDate = parseDateString(contract.createdAt);

      if (startDate !== "") {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (contractDate < start) {
          return false;
        }
      }

      if (endDate !== "") {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (contractDate > end) {
          return false;
        }
      }

      return true;
    });
  }, [search, status, startDate, endDate]);

  // Handle page resets when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setPage(1);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setPage(1);
  };

  // Slice filtered contracts for the current page
  const paginatedContracts = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredContracts.slice(start, start + limit);
  }, [filteredContracts, page, limit]);

  // Export handler
  const handleExport = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredContracts, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `danh_sach_hop_dong_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // View detail handler
  const handleViewDetails = (id: string) => {
    const contract = SAMPLE_CONTRACTS.find((c) => c.id === id);
    if (contract) {
      alert(
        `[Xem chi tiết]\nMã hợp đồng: ${contract.contractCode}\nKhách hàng: ${contract.customerName}\nDịch vụ: ${contract.serviceName}\nNgày tạo: ${contract.createdAt}\nTrạng thái: ${contract.status}`
      );
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <ContractHeader onExport={handleExport} />

      {/* Filters Bar */}
      <ContractFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        startDate={startDate}
        onStartDateChange={handleStartDateChange}
        endDate={endDate}
        onEndDateChange={handleEndDateChange}
      />

      {/* Data Table */}
      <ContractTable
        contracts={paginatedContracts}
        totalCount={filteredContracts.length}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
