"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Contract } from "@/types/Contract";
import { CustomerContractTable } from "@/features/contract/components/CustomerContractTable";
import { CustomerContractFilters } from "@/features/contract/components/CustomerContractFilters";
import { requestGetCustomerContracts } from "@/features/contract/api/contract.api";
import { FileText } from "lucide-react";


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

  // Fetch contracts from API
  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setIsLoading(true);
        const result = await requestGetCustomerContracts({
          page,
          limit,
          search: search.trim() || undefined,
          status: status && status !== "ALL" ? status : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });

        if (active) {
          setContracts(result.contracts || []);
          setTotalCount(result.totalCount || 0);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách hợp đồng:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
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
