"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { requestGetAdminGrowth, type GrowthDataPoint } from "../api/dashboard.api";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface GrowthChartProps {
  timeFilter: "week" | "month" | "year";
}

export function GrowthChart({ timeFilter }: GrowthChartProps) {
  const { dict, locale } = useTranslation();
  const [chartData, setChartData] = useState<GrowthDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    requestGetAdminGrowth(timeFilter)
      .then((res) => {
        setChartData(
          locale === "vi"
            ? res
            : res.map((d) => ({
                ...d,
                name: d.name
                  // week labels: "CN (28/07)" → "Sun (28/07)"
                  .replace(/^CN\b/, "Sun")
                  .replace(/^T2\b/, "Mon")
                  .replace(/^T3\b/, "Tue")
                  .replace(/^T4\b/, "Wed")
                  .replace(/^T5\b/, "Thu")
                  .replace(/^T6\b/, "Fri")
                  .replace(/^T7\b/, "Sat")
                  // year labels: "Th.1" → "Jan", "Th.2" → "Feb" ...
                  .replace(/^Th\.(\d+)$/, (_, m) => {
                    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                    return months[parseInt(m, 10) - 1] ?? `M${m}`;
                  })
                  // month labels: "Tuần 1" → "Week 1"
                  .replace(/^Tuần (\d+)$/, "Week $1"),
              }))
        );
      })
      .catch((err) => {
        console.error("[GrowthChart] Error fetching growth data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [timeFilter, locale]);

  const formatRevenue = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value}`;
  };

  const formatTooltipValue = (value: any, name: any) => {
    if (name === "revenue") {
      const formattedVal =
        locale === "vi"
          ? `${value.toLocaleString("vi-VN")} đ`
          : `${value.toLocaleString("en-US")} VND`;
      return [formattedVal, dict.admin_dashboard.total_revenue || "Doanh thu"];
    }
    return [value, name];
  };

  const getGrowthTitle = (filter: "week" | "month" | "year") => {
    switch (filter) {
      case "week":
        return dict.admin_dashboard.revenue_growth_this_week || (locale === "vi" ? "Tăng trưởng doanh thu tuần này" : "Revenue growth in this week");
      case "month":
        return dict.admin_dashboard.revenue_growth_this_month || (locale === "vi" ? "Tăng trưởng doanh thu tháng này" : "Revenue growth in this month");
      case "year":
        return dict.admin_dashboard.revenue_growth_this_year || (locale === "vi" ? "Tăng trưởng doanh thu năm này" : "Revenue growth in this year");
      default:
        return dict.admin_dashboard.revenue_growth_title || (locale === "vi" ? "Tăng trưởng doanh thu" : "Revenue Growth");
    }
  };

  return (
    <Card className="border border-slate-100 bg-white rounded-xl col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">
          {getGrowthTitle(timeFilter)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full flex items-center justify-center">
          {loading && chartData.length === 0 ? (
            <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
              {dict.admin_dashboard.loading_growth}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatRevenue}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  dx={-5}
                />
                <Tooltip
                  cursor={false}
                  formatter={formatTooltipValue}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontWeight: 600,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
