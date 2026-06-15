"use client";

import { useMemo, useState } from "react";
import { CreateShiftModal } from "@/features/shift/components/CreateShiftModal";
import { ShiftScheduleTable } from "@/features/shift/components/ShiftScheduleTable";
import { ShiftToolbar } from "@/features/shift/components/ShiftToolbar";
import {
  mockShiftAssignments,
  mockShifts,
  mockTimeSlots,
} from "@/features/shift/data/shift.mock";
import {
  getUniqueLocations,
  mergeShiftsWithAssignments,
} from "@/features/shift/utils/shift.utils";

export default function ShiftSchedulePage() {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isCreateShiftModalOpen, setIsCreateShiftModalOpen] = useState(false);

  const shifts = useMemo(() => {
    return mergeShiftsWithAssignments(mockShifts, mockShiftAssignments);
  }, []);

  const locationOptions = useMemo(() => {
    return getUniqueLocations(mockShifts);
  }, []);

  const visibleLocations = useMemo(() => {
    if (selectedLocation === "all") {
      return locationOptions;
    }

    return locationOptions.filter((location) => location === selectedLocation);
  }, [locationOptions, selectedLocation]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <ShiftToolbar
        viewMode={viewMode}
        selectedLocation={selectedLocation}
        locations={locationOptions}
        onChangeViewMode={setViewMode}
        onChangeLocation={setSelectedLocation}
        onClickAdd={() => setIsCreateShiftModalOpen(true)}
      />

      <ShiftScheduleTable
        timeSlots={mockTimeSlots}
        locations={visibleLocations}
        shifts={shifts}
      />

      <CreateShiftModal
        open={isCreateShiftModalOpen}
        onClose={() => setIsCreateShiftModalOpen(false)}
      />
    </div>
  );
}
