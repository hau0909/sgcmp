"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";

type PendingTaskItem = {
  id: string;
  stt: number;
  category: "register" | "urgent" | "compliance";
  categoryText: string;
  time: string;
  title: string;
  description: string;
  status: "pending_approval" | "pending_resolve" | "pending_renew";
  statusText: string;
};

const pendingTasks: PendingTaskItem[] = [
  {
    id: "1",
    stt: 1,
    category: "register",
    categoryText: "ĐĂNG KÝ MỚI",
    time: "2 giờ trước",
    title: "Công ty Bảo vệ An Ninh Nam Sài Gòn",
    description: "Hồ sơ đăng ký doanh nghiệp cần xét duyệt điều khoản...",
    status: "pending_approval",
    statusText: "Chờ duyệt",
  },
  {
    id: "2",
    stt: 2,
    category: "urgent",
    categoryText: "HỖ TRỢ KHẨN CẤP",
    time: "45 phút trước",
    title: "Lỗi thanh toán API #9822",
    description: "Giao dịch bị kẹt ở cổng thanh toán MoMo do timeout...",
    status: "pending_resolve",
    statusText: "Chờ xử lý",
  },
  {
    id: "3",
    stt: 3,
    category: "compliance",
    categoryText: "TUÂN THỦ",
    time: "Hôm qua",
    title: "Gia hạn chứng chỉ nghiệp vụ",
    description: "120 bảo vệ tại Chi nhánh Hà Nội hết hạn chứng chỉ PCCC...",
    status: "pending_renew",
    statusText: "Cần gia hạn",
  },
  {
    id: "4",
    stt: 4,
    category: "register",
    categoryText: "ĐĂNG KÝ MỚI",
    time: "3 giờ trước",
    title: "Công ty Dịch vụ Bảo vệ Đại An",
    description: "Yêu cầu kích hoạt tài khoản doanh nghiệp bảo vệ...",
    status: "pending_approval",
    statusText: "Chờ duyệt",
  },
  {
    id: "5",
    stt: 5,
    category: "compliance",
    categoryText: "TUÂN THỦ",
    time: "5 giờ trước",
    title: "Báo cáo kiểm định thiết bị an ninh",
    description: "Báo cáo tuân thủ tiêu chuẩn thiết bị hàng năm...",
    status: "pending_renew",
    statusText: "Cần gia hạn",
  },
  {
    id: "6",
    stt: 6,
    category: "urgent",
    categoryText: "HỖ TRỢ KHẨN CẤP",
    time: "6 giờ trước",
    title: "Lỗi đồng bộ GPS tuần tra",
    description: "Mất kết nối định vị đối với nhóm tuần tra ca đêm...",
    status: "pending_resolve",
    statusText: "Chờ xử lý",
  },
  {
    id: "7",
    stt: 7,
    category: "register",
    categoryText: "ĐĂNG KÝ MỚI",
    time: "1 ngày trước",
    title: "Công ty Bảo vệ Đông Á",
    description: "Yêu cầu xét duyệt cấp chứng chỉ hoạt động mới...",
    status: "pending_approval",
    statusText: "Chờ duyệt",
  },
  {
    id: "8",
    stt: 8,
    category: "compliance",
    categoryText: "TUÂN THỦ",
    time: "2 ngày trước",
    title: "Chứng chỉ sơ cấp cứu bảo vệ",
    description: "Hạn kiểm định kỹ năng sơ cấp cứu y tế của nhân viên...",
    status: "pending_renew",
    statusText: "Cần gia hạn",
  },
];

export function PendingTasksTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default display is first 5 tasks
  const displayedTasks = pendingTasks.slice(0, 5);

  const getCategoryBadge = (category: PendingTaskItem["category"], text: string) => {
    switch (category) {
      case "register":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100/50">
            {text}
          </span>
        );
      case "urgent":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100/50">
            {text}
          </span>
        );
      case "compliance":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/50">
            {text}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600">
            {text}
          </span>
        );
    }
  };

  const getStatusBadge = (status: PendingTaskItem["status"], text: string) => {
    switch (status) {
      case "pending_approval":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100/50">
            {text}
          </span>
        );
      case "pending_resolve":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100/50 animate-pulse">
            {text}
          </span>
        );
      case "pending_renew":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/50">
            {text}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-600">
            {text}
          </span>
        );
    }
  };

  return (
    <>
      <Card className="border border-slate-100 bg-white rounded-xl col-span-1 lg:col-span-2 flex flex-col justify-between">
        <div className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">
              Đang chờ xử lý
            </CardTitle>
            <span className="text-[11px] font-bold text-slate-400">
              {pendingTasks.length} yêu cầu
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-y border-slate-100">
                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 tracking-wider w-[50px] text-center">
                      STT
                    </th>
                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 tracking-wider">
                      CHI TIẾT CÔNG VIỆC
                    </th>
                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 tracking-wider w-[120px]">
                      THỜI GIAN
                    </th>
                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 tracking-wider w-[140px]">
                      LOẠI YÊU CẦU
                    </th>
                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 tracking-wider w-[120px]">
                      TRẠNG THÁI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {displayedTasks.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3.5 px-5 text-xs text-slate-400 font-semibold text-center whitespace-nowrap">
                        {item.stt}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-800 line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                            {item.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500 whitespace-nowrap">
                        {item.time}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getCategoryBadge(item.category, item.categoryText)}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getStatusBadge(item.status, item.statusText)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </div>

        {pendingTasks.length > 5 && (
          <div className="p-4 border-t border-slate-100 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-blue-600 border-blue-150 bg-blue-50/30 hover:bg-blue-50/60 px-4 h-8 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Xem thêm</span>
              <ChevronDown className="size-3.5" />
            </Button>
          </div>
        )}
      </Card>

      {/* Modal - All Pending Tasks */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Tất cả yêu cầu đang chờ xử lý
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng số {pendingTasks.length} yêu cầu cần được xử lý trong hệ thống
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
            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                  <tr>
                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 tracking-wider w-[50px] text-center">
                      STT
                    </th>
                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 tracking-wider">
                      CHI TIẾT CÔNG VIỆC
                    </th>
                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 tracking-wider w-[120px]">
                      THỜI GIAN
                    </th>
                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 tracking-wider w-[140px]">
                      LOẠI YÊU CẦU
                    </th>
                    <th className="py-3 px-5 text-[11px] font-bold text-slate-400 tracking-wider w-[120px]">
                      TRẠNG THÁI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {pendingTasks.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3.5 px-5 text-xs text-slate-400 font-semibold text-center whitespace-nowrap">
                        {item.stt}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-800">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-500 leading-relaxed">
                            {item.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500 whitespace-nowrap">
                        {item.time}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getCategoryBadge(item.category, item.categoryText)}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getStatusBadge(item.status, item.statusText)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
