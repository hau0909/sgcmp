"use client";

import React from "react";
import { PieChart, Pie, Cell, Label, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const data = [
  { name: "Enterprise", value: 45, count: 578, color: "#0047a0" },
  { name: "Business", value: 35, count: 449, color: "#3b82f6" },
  { name: "Starter", value: 20, count: 257, color: "#334155" },
];

export function PlanDistributionChart() {
  return (
    <Card className="border border-slate-100 bg-white rounded-xl col-span-1 flex flex-col justify-between">
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-semibold text-slate-800">
          Phân bố gói dịch vụ
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 flex flex-col items-center justify-center flex-1">
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
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
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
                            1,284
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
          {data.map((item, index) => (
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
      </CardContent>
    </Card>
  );
}
