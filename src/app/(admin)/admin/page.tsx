"use client";

import React from "react";
import { DashboardHeader } from "@/features/dashboard/component/DashboardHeader";
import { StatsCards } from "@/features/dashboard/component/StatsCards";
import { GrowthChart } from "@/features/dashboard/component/GrowthChart";
import { PlanDistributionChart } from "@/features/dashboard/component/PlanDistributionChart";
import { PendingTasksTable } from "@/features/dashboard/component/PendingTasksTable";
import { RecentActivitiesSteps } from "@/features/dashboard/component/RecentActivitiesSteps";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      {/* Header */}
      <DashboardHeader />

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Charts Row */}
        <GrowthChart />
        <PlanDistributionChart />

        {/* Action / Log Row */}
        <PendingTasksTable />
        <RecentActivitiesSteps />
      </div>
    </div>
  );
}