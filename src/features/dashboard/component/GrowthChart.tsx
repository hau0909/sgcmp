"use client";

import React, { useState } from "react";
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

const data = [
  { name: "THÁNG 1", revenue: 1200000000, companies: 800, fill: "#b4c6e7" },
  { name: "THÁNG 2", revenue: 1600000000, companies: 900, fill: "#b4c6e7" },
  { name: "THÁNG 3", revenue: 1450000000, companies: 940, fill: "#b4c6e7" },
  { name: "THÁNG 4", revenue: 2100000000, companies: 1080, fill: "#b4c6e7" },
  { name: "THÁNG 5", revenue: 1850000000, companies: 1140, fill: "#b4c6e7" },
  { name: "THÁNG 6", revenue: 2450000000, companies: 1284, fill: "#0047a0" }, // Highlighted Month 6
];

export function GrowthChart() {
  const [timeRange, setTimeRange] = useState("6 tháng qua");

  const formatRevenue = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    return `${value / 1000000}M`;
  };

  const formatTooltipValue = (value: any, name: any) => {
    if (name === "revenue") {
      return [`${value.toLocaleString("vi-VN")} đ`, "Doanh thu"];
    }
    if (name === "companies") {
      return [`${value} doanh nghiệp`, "Doanh nghiệp"];
    }
    return [value, name];
  };

  return (
    <Card className="border border-slate-100 bg-white rounded-xl col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">
          Tăng trưởng doanh thu & Doanh nghiệp
        </CardTitle>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 rounded-lg transition-colors cursor-pointer">
          <span>{timeRange}</span>
          <ChevronDown className="size-3.5 text-slate-400" />
        </button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
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
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="companies"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ fill: "#0284c7", strokeWidth: 1, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
