"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, FilePlus2, Globe, BadgeCheck, CircleX, Loader2, ChevronRight, X } from "lucide-react";
import { requestGetAdminRecentActivities, type ActivityItem } from "../api/dashboard.api";

import { useTranslation } from "@/components/providers/LanguageProvider";

interface RecentActivitiesStepsProps {
  timeFilter: "week" | "month" | "year";
}

export function RecentActivitiesSteps({ timeFilter }: RecentActivitiesStepsProps) {
  const { dict, locale } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    requestGetAdminRecentActivities(timeFilter, locale)
      .then((data) => {
        setActivities(data);
      })
      .catch((err) => {
        console.error("Lỗi khi tải nhật ký hoạt động gần đây:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [timeFilter, locale]);

  // Show max 5 items by default
  const displayedSteps = activities.slice(0, 5);

  const getTimeFilterLabel = (filter: "week" | "month" | "year") => {
    if (filter === "week") return dict.admin_dashboard?.filter_week || (locale === "vi" ? "Tuần này" : "This Week");
    if (filter === "year") return dict.admin_dashboard?.filter_year || (locale === "vi" ? "Năm nay" : "This Year");
    return dict.admin_dashboard?.filter_month || (locale === "vi" ? "Tháng này" : "This Month");
  };

  const getActivityIcon = (iconName: ActivityItem["iconName"], iconColor: ActivityItem["iconColor"]) => {
    let colorClasses = "bg-slate-50 border-slate-200 text-slate-600";
    if (iconColor === "blue") {
      colorClasses = "bg-blue-50 border-blue-200 text-blue-600";
    } else if (iconColor === "purple") {
      colorClasses = "bg-purple-50 border-purple-200 text-purple-600 animate-pulse";
    } else if (iconColor === "green") {
      colorClasses = "bg-emerald-50 border-emerald-200 text-emerald-600";
    } else if (iconColor === "red") {
      colorClasses = "bg-rose-50 border-rose-200 text-rose-600";
    }

    const iconProps = { className: "size-3.5" };

    let iconComponent = null;
    switch (iconName) {
      case "Building2":
        iconComponent = <Building2 {...iconProps} />;
        break;
      case "FilePlus2":
        iconComponent = <FilePlus2 {...iconProps} />;
        break;
      case "Globe":
        iconComponent = <Globe {...iconProps} />;
        break;
      case "BadgeCheck":
        iconComponent = <BadgeCheck {...iconProps} />;
        break;
      case "CircleX":
        iconComponent = <CircleX {...iconProps} />;
        break;
      default:
        iconComponent = null;
    }

    return (
      <div className={`z-10 flex items-center justify-center size-6 rounded-full border shadow-sm ${colorClasses}`}>
        {iconComponent}
      </div>
    );
  };

  return (
    <>
      <Card className="border border-slate-100 bg-white rounded-xl col-span-1 flex flex-col justify-between">
        <div className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold text-slate-800">
              {dict.admin_dashboard.recent_activities}
            </CardTitle>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
              {getTimeFilterLabel(timeFilter)}
            </span>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col gap-6">
            <div className="relative mt-2">
              {/* Vertical line connecting the stepper dots */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 border-l border-dashed border-slate-200" />

              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-10 text-xs text-slate-400 gap-2">
                    <Loader2 className="size-4 animate-spin text-blue-500" />
                    <span>{dict.admin_dashboard.loading_activities}</span>
                  </div>
                ) : displayedSteps.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    {dict.admin_dashboard.no_recent_activities}
                  </div>
                ) : (
                  displayedSteps.map((step) => (
                    <div key={step.id} className="relative flex gap-4 items-start pl-8 group">
                      {/* Stepper Node Icon */}
                      <div className="absolute left-0 top-0">
                        {getActivityIcon(step.iconName, step.iconColor)}
                      </div>

                      {/* Stepper Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                            {step.time}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {step.timeAgo}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#0047a0] transition-colors leading-none mb-1.5">
                          {step.action}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {step.target}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-50/50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold text-xs h-9 px-4 rounded-lg flex items-center justify-center gap-1 transition-colors border-0 cursor-pointer"
          >
            <span>{dict.admin_dashboard.view_all_activities}</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </Card>

      {/* Modal - All Recent Activities */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {dict.admin_dashboard.recent_activities_log}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {dict.admin_dashboard.recent_activities_summary.replace("{count}", activities.length.toString())}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                  {getTimeFilterLabel(timeFilter)}
                </span>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="size-4.5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="relative pl-3">
                {/* Vertical line connecting the stepper dots */}
                <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-slate-100 border-l border-dashed border-slate-200" />

                <div className="space-y-6">
                  {activities.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      {dict.admin_dashboard.no_recent_activities}
                    </div>
                  ) : (
                    activities.map((step) => (
                      <div key={step.id} className="relative flex gap-4 items-start pl-8 group">
                        {/* Stepper Node Icon */}
                        <div className="absolute left-0 top-0">
                          {getActivityIcon(step.iconName, step.iconColor)}
                        </div>

                        {/* Stepper Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                              {step.time}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {step.timeAgo}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#0047a0] transition-colors leading-none mb-1.5">
                            {step.action}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {step.target}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-bold px-4 h-8 rounded-lg cursor-pointer bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                {dict.admin_dashboard.close}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
