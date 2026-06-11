"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Contract } from "@/types/Contract";
import { CustomerContractTable } from "@/features/contract/components/CustomerContractTable";
import { CustomerContractFilters } from "@/features/contract/components/CustomerContractFilters";
import { requestGetContracts } from "@/features/contract/api/contract.api";
import { FileText } from "lucide-react";

const MOCK_CONTRACTS: Contract[] = [
  {
    contract_id: "mock-1",
    booking_id: "book-1",
    contract_code: "HD-2026-001",
    customer_name: "Bạn",
    service_name: "Bảo vệ Mục tiêu cố định",
    status: "active" as any,
    start_date: "2026-01-01T00:00:00Z",
    end_date: "2026-12-31T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    contract_file_url: null,
    customer_agreed: true,
    company_agreed: true,
  },
  {
    contract_id: "mock-2",
    booking_id: "book-2",
    contract_code: "HD-2026-002",
    customer_name: "Bạn",
    service_name: "Bảo vệ Sự kiện",
    status: "pending_signatures" as any,
    start_date: "2026-06-15T00:00:00Z",
    end_date: "2026-06-20T00:00:00Z",
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
    contract_file_url: null,
    customer_agreed: false,
    company_agreed: true,
  },
  {
    contract_id: "mock-3",
    booking_id: "book-3",
    contract_code: "HD-2025-099",
    customer_name: "Bạn",
    service_name: "Bảo vệ Áp tải hàng hóa",
    status: "completed" as any,
    start_date: "2025-01-01T00:00:00Z",
    end_date: "2025-12-31T00:00:00Z",
    created_at: "2024-12-20T00:00:00Z",
    updated_at: "2025-12-31T00:00:00Z",
    contract_file_url: null,
    customer_agreed: true,
    company_agreed: true,
  }
];

export default function CustomerContractsPage() {
  const router = useRouter();

  // Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data state
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch contracts from mock data
  useEffect(() => {
    let active = true;
    
    // Giả lập network delay
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (!active) return;
      
      let filtered = [...MOCK_CONTRACTS];
      
      if (search.trim()) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c => 
          c.contract_code?.toLowerCase().includes(s) || 
          c.service_name?.toLowerCase().includes(s)
        );
      }
      
      if (status && status !== "ALL") {
        filtered = filtered.filter(c => c.status === status);
      }
      
      // Pagination logic (giả lập đơn giản)
      const startIdx = (page - 1) * limit;
      const paginated = filtered.slice(startIdx, startIdx + limit);
      
      setContracts(paginated);
      setTotalCount(filtered.length);
      setIsLoading(false);
    }, 600);

    return () => { 
      active = false; 
      clearTimeout(timer);
    };
  }, [page, search, status, startDate, endDate]);

  // Reset page on filter change
  const handleSearchChange = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusChange = (val: string) => { setStatus(val); setPage(1); };
  const handleStartDateChange = (val: string) => { setStartDate(val); setPage(1); };
  const handleEndDateChange = (val: string) => { setEndDate(val); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight font-headline">
              Danh sách hợp đồng
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5 font-body">
              Theo dõi toàn bộ các hợp đồng dịch vụ bảo vệ của bạn.
            </p>
          </div>
        </div>
      </div>



      {/* Filters */}
      <CustomerContractFilters
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
      {isLoading ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-xs text-on-surface-variant/80 font-medium">Đang tải danh sách hợp đồng...</p>
        </div>
      ) : (
        <CustomerContractTable
          contracts={contracts}
          totalCount={totalCount}
          page={page}
          limit={limit}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
