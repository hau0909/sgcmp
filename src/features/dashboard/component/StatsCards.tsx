"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  ClockArrowUp,
  TrendingUp,
  TrendingDown,
  Minus,
  UserRoundPlus,
  CircleDot,
  Globe2,
  BadgeDollarSign,
  Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { requestGetAdminRevenue, requestGetAdminTotalCompanies, requestGetAdminPublishedCompanies, requestGetAdminTotalUsers, requestGetAdminPendingApprovalCompanies, requestGetAdminPendingPublicationRequests, type MetricWithTrend } from "../api/dashboard.api";

export function StatsCards() {
  const [revenue, setRevenue] = useState<MetricWithTrend | null>(null);
  const [totalCompanies, setTotalCompanies] = useState<MetricWithTrend | null>(null);
  const [publishedCompanies, setPublishedCompanies] = useState<MetricWithTrend | null>(null);
  const [totalUsers, setTotalUsers] = useState<MetricWithTrend | null>(null);
  const [pendingApprovalCompanies, setPendingApprovalCompanies] = useState<MetricWithTrend | null>(null);
  const [pendingPublicationRequests, setPendingPublicationRequests] = useState<MetricWithTrend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      requestGetAdminRevenue()
        .then(setRevenue)
        .catch((err) => console.error("[StatsCards] requestGetAdminRevenue Error:", err)),
      requestGetAdminTotalCompanies()
        .then(setTotalCompanies)
        .catch((err) => console.error("[StatsCards] requestGetAdminTotalCompanies Error:", err)),
      requestGetAdminPublishedCompanies()
        .then(setPublishedCompanies)
        .catch((err) => console.error("[StatsCards] requestGetAdminPublishedCompanies Error:", err)),
      requestGetAdminTotalUsers()
        .then(setTotalUsers)
        .catch((err) => console.error("[StatsCards] requestGetAdminTotalUsers Error:", err)),
      requestGetAdminPendingApprovalCompanies()
        .then(setPendingApprovalCompanies)
        .catch((err) => console.error("[StatsCards] requestGetAdminPendingApprovalCompanies Error:", err)),
      requestGetAdminPendingPublicationRequests()
        .then(setPendingPublicationRequests)
        .catch((err) => console.error("[StatsCards] requestGetAdminPendingPublicationRequests Error:", err))
    ]).finally(() => setLoading(false));
  }, []);

  const formattedRevenue = revenue
    ? `${new Intl.NumberFormat("vi-VN").format(revenue.count)} đ`
    : "0 đ";

  const formattedTotalCompanies = totalCompanies
    ? new Intl.NumberFormat("vi-VN").format(totalCompanies.count)
    : "0";

  const formattedPublishedCompanies = publishedCompanies
    ? new Intl.NumberFormat("vi-VN").format(publishedCompanies.count)
    : "0";

  const formattedTotalUsers = totalUsers
    ? new Intl.NumberFormat("vi-VN").format(totalUsers.count)
    : "0";

  const formattedPendingApprovalCompanies = pendingApprovalCompanies
    ? new Intl.NumberFormat("vi-VN").format(pendingApprovalCompanies.count)
    : "0";

  const formattedPendingPublicationRequests = pendingPublicationRequests
    ? new Intl.NumberFormat("vi-VN").format(pendingPublicationRequests.count)
    : "0";

  const getTrendBadge = (metric: MetricWithTrend | null) => {
    if (!metric) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
          <Minus className="size-3" />
          <span>0%</span>
        </span>
      );
    }

    const { percentChange, trend } = metric;
    const isUp = trend === "up";
    const isDown = trend === "down";

    const colorClass = isUp
      ? "text-emerald-600 bg-emerald-50"
      : isDown
        ? "text-rose-600 bg-rose-50"
        : "text-slate-500 bg-slate-50";

    const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
    const sign = isUp ? "+" : "";

    return (
      <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
        <Icon className="size-3" />
        <span>{percentChange !== null ? `${sign}${percentChange}%` : "0%"}</span>
      </span>
    );
  };

  const stats = [
    {
      label: "TỔNG DOANH THU",
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        formattedRevenue
      ),
      icon: BadgeDollarSign,
      iconColor: "text-blue-500 bg-blue-50",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getTrendBadge(revenue)
      ),
    },
    {
      label: "TỔNG DOANH NGHIỆP",
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        formattedTotalCompanies
      ),
      icon: Building2,
      iconColor: "text-blue-600 bg-blue-50/70",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getTrendBadge(totalCompanies)
      ),
    },
    {
      label: "DOANH NGHIỆP ĐANG CÔNG KHAI",
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        formattedPublishedCompanies
      ),
      icon: Globe,
      iconColor: "text-blue-600 bg-blue-50/70",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getTrendBadge(publishedCompanies)
      ),
    },
    {
      label: "TỔNG NGƯỜI DÙNG",
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        formattedTotalUsers
      ),
      icon: UserRoundPlus,
      iconColor: "text-blue-500 bg-blue-50",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getTrendBadge(totalUsers)
      ),
    },
    {
      label: "DOANH NGHIỆP ĐỢI PHÊ DUYỆT",
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        `${formattedPendingApprovalCompanies} chờ phê duyệt`
      ),
      icon: ClockArrowUp,
      iconColor: "text-blue-500 bg-blue-50",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getTrendBadge(pendingApprovalCompanies)
      ),
    },
    {
      label: "YÊU CẦU CÔNG KHAI DOANH NGHIỆP",
      value: loading ? (
        <span className="inline-block w-24 h-6 bg-slate-100 rounded animate-pulse" />
      ) : (
        `${formattedPendingPublicationRequests} chờ công khai`
      ),
      icon: Globe2,
      iconColor: "text-violet-500 bg-violet-50",
      badge: loading ? (
        <span className="inline-block w-12 h-4 bg-slate-50 rounded animate-pulse" />
      ) : (
        getTrendBadge(pendingPublicationRequests)
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card
            key={index}
            className="border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 rounded-xl"
          >
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${item.iconColor} flex items-center justify-center`}>
                  <Icon className="size-5" />
                </div>
                {item.badge}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                  {item.label}
                </span>
                <span className="text-xl font-bold text-slate-800 tracking-tight">
                  {item.value}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
