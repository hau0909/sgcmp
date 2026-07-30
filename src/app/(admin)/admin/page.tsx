"use client";

import React from "react";
import { DashboardHeader } from "@/features/dashboard/component/DashboardHeader";
import { StatsCards } from "@/features/dashboard/component/StatsCards";
import { GrowthChart } from "@/features/dashboard/component/GrowthChart";
import { PlanDistributionChart } from "@/features/dashboard/component/PlanDistributionChart";
import { PendingTasksTable } from "@/features/dashboard/component/PendingTasksTable";
import { RecentActivitiesSteps } from "@/features/dashboard/component/RecentActivitiesSteps";

export default function AdminDashboardPage() {
  const [timeFilter, setTimeFilter] = React.useState<"week" | "month" | "year">("week");
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      {/* Header */}
      <DashboardHeader
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Stats Cards */}
      <StatsCards key={`stats-${refreshKey}`} timeFilter={timeFilter} />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Charts Row */}
        <GrowthChart key={`growth-${refreshKey}`} timeFilter={timeFilter} />
        <PlanDistributionChart key={`plan-${refreshKey}`} />

        {/* Action / Log Row */}
        <PendingTasksTable key={`pending-${refreshKey}`} />
        <RecentActivitiesSteps key={`activities-${refreshKey}`} timeFilter={timeFilter} />
      </div>
    </div>
  );
}