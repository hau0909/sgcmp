"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertTriangle, ChevronRight, HelpCircle, X } from "lucide-react";

type ActivityStep = {
  id: string;
  time: string;
  timeAgo: string;
  action: string;
  target: string;
  status: "success" | "pending" | "done" | "failed";
  statusText: string;
};

const steps: ActivityStep[] = [
  {
    id: "1",
    time: "10:24 AM",
    timeAgo: "2 giờ trước",
    action: "Phê duyệt doanh nghiệp",
    target: "Vingroup Security Services",
    status: "success",
    statusText: "THÀNH CÔNG",
  },
  {
    id: "2",
    time: "09:15 AM",
    timeAgo: "3 giờ trước",
    action: "Thanh toán mới",
    target: "Techcombank Corporate",
    status: "pending",
    statusText: "ĐANG CHỜ",
  },
  {
    id: "3",
    time: "08:50 AM",
    timeAgo: "4 giờ trước",
    action: "Cập nhật hệ thống",
    target: "Node-AP-Southeast-1",
    status: "done",
    statusText: "HOÀN TẤT",
  },
  {
    id: "4",
    time: "07:30 AM",
    timeAgo: "5 giờ trước",
    action: "Cảnh báo bảo mật",
    target: "User: admin_test_01",
    status: "failed",
    statusText: "BỊ TỪ CHỐI",
  },
  {
    id: "5",
    time: "06:10 AM",
    timeAgo: "6 giờ trước",
    action: "Tạo lịch trực mới",
    target: "Chi nhánh Quận 1",
    status: "done",
    statusText: "HOÀN TẤT",
  },
  {
    id: "6",
    time: "05:00 AM",
    timeAgo: "7 giờ trước",
    action: "Yêu cầu hỗ trợ kỹ thuật",
    target: "Khách hàng: Nguyễn Văn A",
    status: "success",
    statusText: "THÀNH CÔNG",
  },
  {
    id: "7",
    time: "04:30 AM",
    timeAgo: "8 giờ trước",
    action: "Cập nhật hồ sơ bảo vệ",
    target: "Guard: Trần Văn B",
    status: "done",
    statusText: "HOÀN TẤT",
  },
  {
    id: "8",
    time: "03:00 AM",
    timeAgo: "9 giờ trước",
    action: "Sao lưu dữ liệu định kỳ",
    target: "System Backup Manager",
    status: "done",
    statusText: "HOÀN TẤT",
  },
];

export function RecentActivitiesSteps() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Show max 5 items by default
  const displayedSteps = steps.slice(0, 5);

  const getStatusIcon = (status: ActivityStep["status"]) => {
    switch (status) {
      case "success":
      case "done":
        return (
          <div className="z-10 flex items-center justify-center size-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm">
            <CheckCircle2 className="size-3.5" />
          </div>
        );
      case "pending":
        return (
          <div className="z-10 flex items-center justify-center size-6 rounded-full bg-blue-50 border border-blue-200 text-blue-600 shadow-sm animate-pulse">
            <Clock className="size-3.5" />
          </div>
        );
      case "failed":
        return (
          <div className="z-10 flex items-center justify-center size-6 rounded-full bg-rose-50 border border-rose-200 text-rose-600 shadow-sm">
            <AlertTriangle className="size-3.5" />
          </div>
        );
      default:
        return (
          <div className="z-10 flex items-center justify-center size-6 rounded-full bg-slate-50 border border-slate-200 text-slate-500 shadow-sm">
            <HelpCircle className="size-3.5" />
          </div>
        );
    }
  };

  return (
    <>
      <Card className="border border-slate-100 bg-white rounded-xl col-span-1 flex flex-col justify-between">
        <div className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col gap-6">
            <div className="relative mt-2">
              {/* Vertical line connecting the stepper dots */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 border-l border-dashed border-slate-200" />

              <div className="space-y-6">
                {displayedSteps.map((step) => (
                  <div key={step.id} className="relative flex gap-4 items-start pl-8 group">
                    {/* Stepper Node Icon */}
                    <div className="absolute left-0 top-0">
                      {getStatusIcon(step.status)}
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
                ))}
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
            <span>Xem toàn bộ hoạt động</span>
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
                  Nhật ký hoạt động gần đây
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng hợp {steps.length} hoạt động gần nhất của hệ thống
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="relative pl-3">
                {/* Vertical line connecting the stepper dots */}
                <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-slate-100 border-l border-dashed border-slate-200" />

                <div className="space-y-6">
                  {steps.map((step) => (
                    <div key={step.id} className="relative flex gap-4 items-start pl-8 group">
                      {/* Stepper Node Icon */}
                      <div className="absolute left-0 top-0">
                        {getStatusIcon(step.status)}
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
                  ))}
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
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
