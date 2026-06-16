"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateShiftModal } from "@/features/shift/components/CreateShiftModal";
import { ShiftScheduleTable } from "@/features/shift/components/ShiftScheduleTable";
import { ShiftToolbar } from "@/features/shift/components/ShiftToolbar";
import {
  requestGetAllShiftsByDay,
  requestGetAllShiftsByWeek,
  requestGetShiftContracts,
} from "@/features/shift/api/shift.api";
import type {
  ContractOption,
  ShiftWithAssignments,
} from "@/features/shift/type";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

const getVietnamTodayKey = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: VIETNAM_TIME_ZONE,
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
  return Array.from(
    new Set(
      contracts
        .map((contract) => contract.address)
        .filter((address): address is string => Boolean(address)),
    ),
  );
};

type ShiftScheduleSkeletonProps = {
  viewMode: "day" | "week";
};

function ShiftScheduleSkeleton({ viewMode }: ShiftScheduleSkeletonProps) {
  if (viewMode === "week") {
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

  return (
    <div className="relative overflow-hidden rounded-sm border border-slate-300 bg-white">
      <div className="grid grid-cols-[220px_220px_220px] bg-blue-100">
        <div className="border-r border-slate-300 p-4">
          <div className="h-5 w-36 animate-pulse rounded bg-blue-200" />
        </div>

        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="border-r border-slate-300 p-4 text-center last:border-r-0"
          >
            <div className="mx-auto h-5 w-28 animate-pulse rounded bg-blue-200" />
          </div>
        ))}
      </div>

      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-[220px_220px_220px] border-t border-slate-300"
        >
          <div className="min-h-[130px] border-r border-slate-300 bg-white p-4">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-24 animate-pulse rounded bg-slate-200" />
          </div>

          {Array.from({ length: 2 }).map((_, cellIndex) => (
            <div
              key={cellIndex}
              className="min-h-[130px] border-r border-slate-300 p-2 last:border-r-0"
            >
              {rowIndex === 0 && cellIndex === 0 ? (
                <div className="h-full rounded-md border border-blue-100 bg-blue-50 p-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-blue-200" />
                  <div className="mt-3 h-4 w-28 animate-pulse rounded bg-blue-200" />
                  <div className="mt-3 h-3 w-20 animate-pulse rounded bg-blue-200" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ShiftSchedulePage() {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [currentDate, setCurrentDate] = useState(getVietnamTodayKey());
  const [shifts, setShifts] = useState<ShiftWithAssignments[]>([]);
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateShiftModalOpen, setIsCreateShiftModalOpen] = useState(false);

  const fetchContracts = useCallback(async () => {
    try {
      const response = await requestGetShiftContracts();

      setContracts(response.data ?? []);
    } catch {
      setContracts([]);
    }
  }, []);

  const fetchShifts = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response =
        viewMode === "day"
          ? await requestGetAllShiftsByDay({
              date: currentDate,
              location: selectedLocation,
            })
          : await requestGetAllShiftsByWeek({
              date: currentDate,
              location: selectedLocation,
            });

      setShifts(response.data ?? []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách ca trực";

      setErrorMessage(message);
      setShifts([]);
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, currentDate, selectedLocation]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchContracts();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchContracts]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchShifts();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [fetchShifts]);

  const handleCreatedShift = async () => {
    await fetchShifts();
    await fetchContracts();
  };

  const locationOptions = useMemo(() => {
    return getUniqueLocationsFromContracts(contracts);
  }, [contracts]);

  const tableLocations = useMemo(() => {
    const contractLocations = getUniqueLocationsFromContracts(contracts);

    if (selectedLocation === "all") {
      return Array.from(
        new Set(
          shifts
            .map((shift) => shift.contract_address)
            .filter((address): address is string => Boolean(address)),
        ),
      );
    }

    return contractLocations.filter(
      (location) => location === selectedLocation,
    );
  }, [contracts, shifts, selectedLocation]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <ShiftToolbar
        viewMode={viewMode}
        selectedLocation={selectedLocation}
        locations={locationOptions}
        currentDate={currentDate}
        onChangeViewMode={setViewMode}
        onChangeLocation={setSelectedLocation}
        onChangeDate={setCurrentDate}
        onClickAdd={() => setIsCreateShiftModalOpen(true)}
      />

      {isLoading ? (
        <ShiftScheduleSkeleton viewMode={viewMode} />
      ) : errorMessage ? (
        <div className="rounded-sm border border-red-300 bg-red-50 p-10 text-center">
          <p className="text-sm font-medium text-red-600">{errorMessage}</p>
        </div>
      ) : (
        <ShiftScheduleTable
          viewMode={viewMode}
          locations={tableLocations}
          shifts={shifts}
          selectedLocation={selectedLocation}
          weekStartDate={currentDate}
        />
      )}

      <CreateShiftModal
        open={isCreateShiftModalOpen}
        onClose={() => setIsCreateShiftModalOpen(false)}
        onCreated={handleCreatedShift}
      />
    </div>
  );
}
