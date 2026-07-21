"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CoordinatorTable } from "@/features/coordinator/components/CoordinatorTable";
import { CoordinatorHeader } from "@/features/coordinator/components/CoordinatorHeader";
import { CoordinatorFilters } from "@/features/coordinator/components/CoordinatorFilters";

export default function CoordinatorPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const handleCreateNew = () => {
    router.push("/coordinators/add");
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-6">
      <CoordinatorHeader onCreateNew={handleCreateNew} />

      <CoordinatorFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      <CoordinatorTable searchStr={search} statusFilter={status} />

      <div className="h-8" />
    </div>
  );
}
