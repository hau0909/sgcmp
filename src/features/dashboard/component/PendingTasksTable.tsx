"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, X, Loader2 } from "lucide-react";
import { requestGetAdminPendingTasks, type PendingTaskItem } from "../api/dashboard.api";

export function PendingTasksTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<PendingTaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestGetAdminPendingTasks()
      .then((data) => {
        setTasks(data);
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách yêu cầu đang chờ xử lý:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Default display is first 5 tasks
  const displayedTasks = tasks.slice(0, 5);


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
              {tasks.length} yêu cầu
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
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="size-4 animate-spin text-blue-500" />
                          <span>Đang tải danh sách...</span>
                        </div>
                      </td>
                    </tr>
                  ) : displayedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        Không có yêu cầu nào đang chờ xử lý.
                      </td>
                    </tr>
                  ) : (
                    displayedTasks.map((item) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </div>

        {tasks.length > 5 && (
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
                  Tổng số {tasks.length} yêu cầu cần được xử lý trong hệ thống
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
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        Không có yêu cầu nào đang chờ xử lý.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((item) => (
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
                    ))
                  )}
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
