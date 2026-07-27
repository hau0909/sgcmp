import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { requestGetAdminGrowth, type GrowthDataPoint } from "../api/dashboard.api";
import { useTranslation } from "@/components/providers/LanguageProvider";

export function GrowthChart() {
  const { dict, locale } = useTranslation();
  const [timeRange, setTimeRange] = useState<"6m" | "1y">("6m");
  const [chartData, setChartData] = useState<GrowthDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    requestGetAdminGrowth(timeRange)
      .then((res) => {
        setChartData(res);
      })
      .catch((err) => {
        console.error("[GrowthChart] Error fetching growth data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [timeRange]);

  const formatRevenue = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    return `${value / 1000000}M`;
  };

  const formatTooltipValue = (value: any, name: any) => {
    if (name === "revenue") {
      const formattedVal = locale === "vi"
        ? `${value.toLocaleString("vi-VN")} đ`
        : `${value.toLocaleString("en-US")} VND`;
      return [formattedVal, dict.admin_dashboard.revenue];
    }
    if (name === "companies") {
      const formattedVal = locale === "vi"
        ? `${value} doanh nghiệp`
        : `${value} ${value === 1 ? "company" : "companies"}`;
      return [formattedVal, dict.admin_dashboard.company];
    }
    return [value, name];
  };

  return (
    <Card className="border border-slate-100 bg-white rounded-xl col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">
          {dict.admin_dashboard.revenue_growth_title}
        </CardTitle>
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "6m" | "1y")}
            className="appearance-none bg-white pl-3 pr-8 py-1.5 border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 rounded-lg transition-colors cursor-pointer outline-none"
          >
            <option value="6m">{dict.admin_dashboard.six_months_ago}</option>
            <option value="1y">{dict.admin_dashboard.one_year_ago}</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full flex items-center justify-center">
          {loading && chartData.length === 0 ? (
            <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
              {dict.admin_dashboard.loading_growth}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
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
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatRevenue}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  dx={-5}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  dx={5}
                />
                <Tooltip
                  formatter={formatTooltipValue}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="companies"
                  stroke="#1E80FF"
                  strokeWidth={2.5}
                  dot={{ fill: "#1E80FF", stroke: "#1E80FF", strokeWidth: 1, r: 3 }}
                  activeDot={{ fill: "#1E80FF", stroke: "#1E80FF", r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
