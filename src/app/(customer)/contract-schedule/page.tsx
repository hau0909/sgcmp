"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { ShiftScheduleTable } from "@/features/shift/components/ShiftScheduleTable";
import { ShiftToolbar } from "@/features/shift/components/ShiftToolbar";
import {
  requestGetCustomerShiftContracts,
  requestGetCustomerShiftsByWeek,
} from "@/features/shift/api/shift.api";
import type {
  ContractOption,
  ShiftWithAssignments,
} from "@/features/shift/type";
import { getUserTimeZone } from "@/utils/dateTime";
import { useAuthStore } from "@/store/auth.store";

const getTodayKey = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: getUserTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
};

const getUniqueLocationsFromContracts = (contracts: ContractOption[]) => {
  const seen = new Set<string>();
  const results: { address: string; status: string; customer_name?: string; company_name?: string; code?: string }[] = [];
  for (const contract of contracts) {
    if (contract.address && !seen.has(contract.address)) {
      seen.add(contract.address);
      results.push({
        address: contract.address,
        status: contract.status,
        customer_name: contract.customer_name,
        company_name: contract.company_name,
        code: contract.code,
      });
    }
  }
  return results;
};

function ShiftScheduleSkeleton() {
  return (
    <div className="overflow-hidden rounded-sm border border-slate-300 bg-white">
      <div className="grid grid-cols-7 border-b border-slate-300">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="border-r border-slate-300 bg-slate-100 px-4 py-3 text-center last:border-r-0"
          >
            <div className="mx-auto h-3 w-14 animate-pulse rounded bg-slate-300" />
            <div className="mx-auto mt-3 h-7 w-8 animate-pulse rounded bg-slate-300" />
          </div>
        ))}
      </div>

      <div className="grid min-h-[640px] grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="min-h-[640px] border-r border-slate-300 bg-white p-3 last:border-r-0"
          >
            {index === 0 || index === 2 ? (
              <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
                <div className="h-4 w-24 animate-pulse rounded bg-blue-200" />
                <div className="mt-3 h-4 w-28 animate-pulse rounded bg-blue-200" />
                <div className="mt-3 h-3 w-20 animate-pulse rounded bg-blue-200" />
              </div>
            ) : (
              <div className="flex h-full min-h-[520px] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-3 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomerGuardSchedulePage() {
  const { dict } = useTranslation();
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentDate, setCurrentDate] = useState(getTodayKey());
  const [shifts, setShifts] = useState<ShiftWithAssignments[]>([]);
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchContracts = useCallback(async () => {
    try {
      const response = await requestGetCustomerShiftContracts();
      setContracts(response.data ?? []);
    } catch {
      setContracts([]);
    }
  }, []);

  const fetchShifts = useCallback(async () => {
    if (!selectedLocation) {
      return;
    }
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await requestGetCustomerShiftsByWeek({
        date: currentDate,
        location: selectedLocation,
      });

      setShifts(response.data ?? []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : (dict?.shift_schedule_table?.error_fetch || "Không thể tải danh sách ca trực");

      setErrorMessage(message);
      setShifts([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, selectedLocation, dict]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchContracts();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchContracts]);

  const locationOptions = useMemo(() => {
    return getUniqueLocationsFromContracts(contracts);
  }, [contracts]);

  useEffect(() => {
    if (locationOptions.length > 0 && !selectedLocation) {
      setSelectedLocation(locationOptions[0].address);
    }
  }, [locationOptions, selectedLocation]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchShifts();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchShifts]);

  const tableLocations = useMemo(() => {
    const contractLocations = getUniqueLocationsFromContracts(contracts).map((c) => c.address);

    if (selectedLocation === "all") {
      return contractLocations;
    }

    return contractLocations.filter(
      (location) => location === selectedLocation,
    );
  }, [contracts, selectedLocation]);

  return (
    <div className="max-w-7xl mx-auto w-full px-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 shrink-0 border border-blue-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {dict?.customer_guard_schedule?.title || dict?.common?.guardSchedule || "Lịch Trực Bảo Vệ"}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {dict?.customer_guard_schedule?.subtitle || "Xem ca trực của bảo vệ theo tuần tại các vị trí hợp đồng"}
            </p>
          </div>
        </div>
      </div>

      <ShiftToolbar
        viewMode="week"
        hideViewModeToggle={true}
        selectedLocation={selectedLocation}
        locations={locationOptions}
        currentDate={currentDate}
        onChangeLocation={setSelectedLocation}
        onChangeDate={setCurrentDate}
      />

      {isLoading ? (
        <ShiftScheduleSkeleton />
      ) : errorMessage ? (
        <div className="rounded-sm border border-red-300 bg-red-50 p-10 text-center">
          <p className="text-sm font-medium text-red-600">{errorMessage}</p>
        </div>
      ) : (
        <ShiftScheduleTable
          viewMode="week"
          locations={tableLocations}
          contracts={contracts}
          shifts={shifts}
          selectedLocation={selectedLocation}
          weekStartDate={currentDate}
          readOnly={true}
          onReportShift={
            role === "customer"
              ? (shiftId, contractId, shiftDate) =>
                  router.push(
                    `/my-reports?contractId=${encodeURIComponent(contractId)}&shiftId=${encodeURIComponent(shiftId)}${shiftDate ? `&date=${encodeURIComponent(shiftDate)}` : ""}`,
                  )
              : undefined
          }
        />
      )}
    </div>
  );
}
