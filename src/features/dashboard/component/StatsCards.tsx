"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  ClockArrowUp,
  UserRoundPlus,
  Globe2,
  BadgeDollarSign,
  UserCheck,
  ShieldCheck,
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  requestGetAdminRevenue,
  requestGetAdminUserByRole,
  requestGetAdminPendingApprovalCompanies,
  requestGetAdminPendingPublicationRequests,
  requestGetAdminPendingPublicationList,
  type MetricWithTrend,
  type PendingPublicationListItem,
} from "../api/dashboard.api";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface StatsCardsProps {
  timeFilter: "week" | "month" | "year";
}

export function StatsCards({ timeFilter }: StatsCardsProps) {
  const { dict, locale } = useTranslation();
  const [revenue, setRevenue] = useState<MetricWithTrend | null>(null);
  const [companyAdminUsers, setCompanyAdminUsers] = useState<MetricWithTrend | null>(null);
  const [customerUsers, setCustomerUsers] = useState<MetricWithTrend | null>(null);
  const [pendingApprovalCompanies, setPendingApprovalCompanies] = useState<MetricWithTrend | null>(null);
  const [pendingPublicationRequests, setPendingPublicationRequests] = useState<MetricWithTrend | null>(null);
  const [pendingPublicationList, setPendingPublicationList] = useState<PendingPublicationListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      requestGetAdminRevenue(timeFilter)
        .then(setRevenue)
        .catch((err) => console.error("[StatsCards] requestGetAdminRevenue Error:", err)),
      requestGetAdminUserByRole("company-admin", timeFilter)
        .then(setCompanyAdminUsers)
        .catch((err) => console.error("[StatsCards] requestGetAdminUserByRole company-admin Error:", err)),
      requestGetAdminUserByRole("customer", timeFilter)
        .then(setCustomerUsers)
        .catch((err) => console.error("[StatsCards] requestGetAdminUserByRole customer Error:", err)),
      requestGetAdminPendingApprovalCompanies(timeFilter)
        .then(setPendingApprovalCompanies)
        .catch((err) => console.error("[StatsCards] requestGetAdminPendingApprovalCompanies Error:", err)),
      requestGetAdminPendingPublicationRequests(timeFilter)
        .then(setPendingPublicationRequests)
        .catch((err) => console.error("[StatsCards] requestGetAdminPendingPublicationRequests Error:", err)),
    ]).finally(() => setLoading(false));
  }, [timeFilter]);

  useEffect(() => {
    setLoadingList(true);
    requestGetAdminPendingPublicationList()
      .then(setPendingPublicationList)
      .catch((err) => console.error("[StatsCards] requestGetAdminPendingPublicationList Error:", err))
      .finally(() => setLoadingList(false));
  }, []);

  const numLocale = locale === "vi" ? "vi-VN" : "en-US";

  const formattedRevenue = revenue
    ? locale === "vi"
      ? `${new Intl.NumberFormat(numLocale).format(revenue.count)} đ`
      : `${new Intl.NumberFormat(numLocale).format(revenue.count)} VND`
    : locale === "vi"
      ? "0 đ"
      : "0 VND";

  const formattedCompanyAdminUsers = companyAdminUsers
    ? new Intl.NumberFormat(numLocale).format(companyAdminUsers.count)
    : "0";

  const formattedCustomerUsers = customerUsers
    ? new Intl.NumberFormat(numLocale).format(customerUsers.count)
    : "0";

  const formattedPendingApprovalCompanies = pendingApprovalCompanies
    ? new Intl.NumberFormat(numLocale).format(pendingApprovalCompanies.count)
    : "0";

  const formattedPendingPublicationRequests = pendingPublicationRequests
    ? new Intl.NumberFormat(numLocale).format(pendingPublicationRequests.count)
    : "0";

  const getAddedBadge = (metric: MetricWithTrend | null, isCurrency: boolean = false) => {
    if (!metric || metric.addedCount === undefined || metric.addedCount === null) {
      return (
        <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
          +0
        </span>
      );
    }

    const added = metric.addedCount;
    const isPositive = added > 0;

    let text = `+${added}`;
    if (isCurrency) {
      text = locale === "vi"
        ? `+${new Intl.NumberFormat(numLocale).format(added)} đ`
        : `+${new Intl.NumberFormat(numLocale).format(added)} VND`;
    }

    const badgeStyle = isPositive
      ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
      : "text-slate-500 bg-slate-50 border-slate-100";

    return (
      <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
        {text}
      </span>
    );
  };

  const getRevenueLabel = (filter: "week" | "month" | "year") => {
    switch (filter) {
      case "week":
        return dict.admin_dashboard.revenue_this_week || (locale === "vi" ? "Doanh thu tuần này" : "Revenue in this week");
      case "month":
        return dict.admin_dashboard.revenue_this_month || (locale === "vi" ? "Doanh thu tháng này" : "Revenue in this month");
      case "year":
        return dict.admin_dashboard.revenue_this_year || (locale === "vi" ? "Doanh thu năm này" : "Revenue in this year");
      default:
        return dict.admin_dashboard.total_revenue || (locale === "vi" ? "TỔNG DOANH THU" : "TOTAL REVENUE");
    }
  };

  const stats = [
    {
      label: getRevenueLabel(timeFilter),
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        formattedRevenue
      ),
      icon: BadgeDollarSign,
      iconColor: "text-blue-600 bg-blue-50/80",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getAddedBadge(revenue, true)
      ),
    },
    {
      label: dict.admin_dashboard.company_admin_users || "DOANH NGHIỆP BẢO VỆ",
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        formattedCompanyAdminUsers
      ),
      icon: ShieldCheck,
      iconColor: "text-indigo-600 bg-indigo-50/80",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getAddedBadge(companyAdminUsers)
      ),
    },
    {
      label: dict.admin_dashboard.customer_users || "KHÁCH HÀNG",
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        formattedCustomerUsers
      ),
      icon: UserCheck,
      iconColor: "text-emerald-600 bg-emerald-50/80",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getAddedBadge(customerUsers)
      ),
    },
    {
      label: dict.admin_dashboard.pending_approval_companies,
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        `${formattedPendingApprovalCompanies} ${dict.admin_dashboard.awaiting_approval}`
      ),
      icon: ClockArrowUp,
      iconColor: "text-amber-600 bg-amber-50/80",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getAddedBadge(pendingApprovalCompanies)
      ),
    },
    {
      label: dict.admin_dashboard.pending_publication_requests,
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        `${formattedPendingPublicationRequests} ${dict.admin_dashboard.awaiting_publication}`
      ),
      icon: Globe2,
      iconColor: "text-purple-600 bg-purple-50/80",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getAddedBadge(pendingPublicationRequests)
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-4 items-stretch">
      {/* Col 1: Revenue + Company Admin */}
      <div className="flex flex-col gap-4 h-full">
        {/* Card 1: Revenue */}
        {(() => {
          const item = stats[0];
          const Icon = item.icon;
          return (
            <Card className="flex-1 border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 rounded-xl">
              <CardContent className="p-5 flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg ${item.iconColor} flex items-center justify-center`}>
                    <Icon className="size-5" />
                  </div>
                  {item.badge}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider">{item.label}</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">{item.value}</span>
                </div>
              </CardContent>
            </Card>
          );
        })()}
        {/* Card 2: Company Admin Users */}
        {(() => {
          const item = stats[1];
          const Icon = item.icon;
          return (
            <Card className="flex-1 border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 rounded-xl">
              <CardContent className="p-5 flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg ${item.iconColor} flex items-center justify-center`}>
                    <Icon className="size-5" />
                  </div>
                  {item.badge}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider">{item.label}</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">{item.value}</span>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Col 2: Customer + Pending Approval */}
      <div className="flex flex-col gap-4 h-full">
        {/* Card 3: Customer Users */}
        {(() => {
          const item = stats[2];
          const Icon = item.icon;
          return (
            <Card className="flex-1 border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 rounded-xl">
              <CardContent className="p-5 flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg ${item.iconColor} flex items-center justify-center`}>
                    <Icon className="size-5" />
                  </div>
                  {item.badge}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider">{item.label}</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">{item.value}</span>
                </div>
              </CardContent>
            </Card>
          );
        })()}
        {/* Card 4: Pending Approval */}
        {(() => {
          const item = stats[3];
          const Icon = item.icon;
          return (
            <Card className="flex-1 border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 rounded-xl">
              <CardContent className="p-5 flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg ${item.iconColor} flex items-center justify-center`}>
                    <Icon className="size-5" />
                  </div>
                  {item.badge}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider">{item.label}</span>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">{item.value}</span>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Col 3: Pending Publication — tall card spanning both rows */}
      {(() => {
        const item = stats[4];
        const Icon = item.icon;
        return (
          <Card className="border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 rounded-xl row-span-2 lg:row-span-1 lg:h-full overflow-hidden">
            <CardContent className="p-5 flex flex-col gap-4 h-full overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${item.iconColor} flex items-center justify-center`}>
                  <Icon className="size-5" />
                </div>
                {item.badge}
              </div>
              {/* Count + label */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider">{item.label}</span>
                <span className="text-xl font-bold text-slate-800 tracking-tight">{item.value}</span>
              </div>
              {/* Divider */}
              <div className="border-t border-slate-100" />
              {/* Scrollable list */}
              <div className="overflow-y-auto flex flex-col gap-2" style={{ maxHeight: "180px" }}>
                {loadingList ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                  ))
                ) : pendingPublicationList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 py-6">
                    <Globe2 className="size-8 text-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">
                      {locale === "vi" ? "Không có yêu cầu chờ công khai" : "No pending publication requests"}
                    </span>
                  </div>
                ) : (
                  pendingPublicationList.map((req) => (
                    <div
                      key={req.request_id}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-purple-50/60 border border-purple-100/60 hover:border-purple-200/80 hover:bg-purple-50 transition-all duration-150"
                    >
                      <div className="mt-0.5 size-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="size-3.5 text-purple-600" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[12px] font-semibold text-slate-800 truncate leading-tight">
                          {req.company_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(req.requested_at).toLocaleDateString(numLocale, {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
