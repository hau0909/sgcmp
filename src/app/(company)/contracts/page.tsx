"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Contract } from "@/types/Contract";
import { ContractHeader } from "@/features/contract/components/ContractHeader";
import { ContractFilters } from "@/features/contract/components/ContractFilters";
import { ContractTable } from "@/features/contract/components/ContractTable";
import { requestGetContracts } from "@/features/contract/api/contract.api";
import { useAuthStore } from "@/store/auth.store";

export default function ContractsPage() {
  const router = useRouter();
  const companyId = useAuthStore((state) => state.company_id);

  // Filters state
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
  const limit = 5; // Page size of 5 matching the design spec

  // Fetch contracts from API
  useEffect(() => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    const fetchContracts = async () => {
      setIsLoading(true);
      try {
        const result = await requestGetContracts({
          companyId,
          page,
          limit,
          search: search.trim() || undefined,
          status: status || undefined,
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
    };

    fetchContracts();

    return () => {
      active = false;
    };
  }, [page, search, status, startDate, endDate, companyId]);

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

  // Export handler
  const handleExport = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(contracts, null, 2)
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
    router.push(`/contracts/${id}`);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
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
      {isLoading ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
          <p className="text-xs text-on-surface-variant/80 font-medium">Đang tải danh sách hợp đồng...</p>
        </div>
      ) : (
        <ContractTable
          contracts={contracts}
          totalCount={totalCount}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}
