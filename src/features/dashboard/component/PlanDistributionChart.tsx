"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Label, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { requestGetAdminPlanDistribution, type PlanDistributionItem } from "../api/dashboard.api";

export function PlanDistributionChart() {
  const [chartData, setChartData] = useState<PlanDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestGetAdminPlanDistribution()
      .then((res) => {
        setChartData(res);
      })
      .catch((err) => {
        console.error("[PlanDistributionChart] Error fetching distribution:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="border border-slate-100 bg-white rounded-xl col-span-1 flex flex-col justify-between">
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-semibold text-slate-800">
          Phân bố gói dịch vụ
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 flex flex-col items-center justify-center flex-1">
        {loading && chartData.length === 0 ? (
          <div className="w-full flex-1 min-h-[220px] flex items-center justify-center">
            <div className="size-[160px] bg-slate-50 animate-pulse rounded-full flex items-center justify-center text-slate-400 text-[10px] font-medium">
              Đang tải...
            </div>
          </div>
        ) : (
          <>
            <div className="size-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => {
                      const payload = props.payload;
                      return [`${value}% (${payload.count} doanh nghiệp)`, name];
                    }}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-slate-800 text-lg font-bold tracking-tight"
                              >
                                {total.toLocaleString("vi-VN")}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 16}
                                className="fill-slate-400 text-[10px] font-semibold"
                              >
                                Tổng cộng
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full mt-6 space-y-3">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-[3px]"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
