"use client";

import React from "react";
import {
  ChevronRight,
  ChevronLeft,
  Layers,
  RefreshCw,
  Search,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";

import type { Service } from "@/types/Service";
import { requestGetAdminServices, requestDeleteService } from "../api/service.api";
import ServiceFormDialog from "./ServiceFormDialog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

const ITEMS_PER_PAGE = 10;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ServiceTable() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Create modal state
  const [showModal, setShowModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [selectedService, setSelectedService] = React.useState<Service | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [serviceToDelete, setServiceToDelete] = React.useState<Service | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadData = React.useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await requestGetAdminServices();
      setServices(data);
    } catch (err) {
      console.error("[ServiceTable] Lỗi khi tải danh sách dịch vụ:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Client-side search filter
  const filteredServices = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q));
  }, [services, search]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / ITEMS_PER_PAGE));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedServices = React.useMemo(() => {
    return filteredServices.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredServices, currentPage]);

  // Clear toast notifications after 4 seconds
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // ─── Modal handlers ───────────────────────────────────────────────────────

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedService(undefined);
    setShowModal(true);
  };
  
  const handleOpenEditModal = (service: Service) => {
    setModalMode("edit");
    setSelectedService(service);
    setShowModal(true);
  };
  
  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    setSubmittingDelete(true);
    try {
      const res = await requestDeleteService(serviceToDelete.service_id);
      if (res.success) {
        setToastMessage({ text: "Xóa dịch vụ thành công!", type: "success" });
        loadData(false);
      } else {
        setToastMessage({ text: res.message || "Xóa thất bại", type: "error" });
      }
    } catch (err: any) {
      setToastMessage({ text: "Lỗi hệ thống khi xóa dịch vụ.", type: "error" });
    } finally {
      setSubmittingDelete(false);
      setShowDeleteModal(false);
      setServiceToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          <span className="animate-pulse">Đang tải danh sách dịch vụ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <nav className="flex items-center gap-1 text-on-surface-variant/80 text-xs font-medium mb-1">
            <span className="hover:text-primary cursor-pointer transition-colors">
              Hệ thống
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/50 shrink-0" />
            <span className="text-primary font-bold">Dịch vụ</span>
          </nav>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            Danh sách dịch vụ
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Tất cả các dịch vụ đang được cung cấp trên hệ thống.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => loadData(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container-low transition-all text-on-surface cursor-pointer shadow-sm"
          >
            <RefreshCw className="text-on-surface-variant w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm dịch vụ</span>
          </button>
        </div>
      </div>

      {/* Search + Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-2 flex-1 bg-white border border-outline-variant rounded-lg px-3 py-2 focus-within:border-primary transition-colors">
          <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm theo tên dịch vụ..."
            className="bg-transparent border-none outline-none text-sm text-on-surface w-full placeholder-on-surface-variant"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#eff4ff] rounded-lg border border-[#c3c6d3] shrink-0">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            {filteredServices.length} dịch vụ
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#d5e3ff] border-b border-outline-variant">
                <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[60px] text-center whitespace-nowrap">
                  STT
                </th>
                <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap min-w-[200px]">
                  Tên dịch vụ
                </th>
                <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap min-w-[260px]">
                  Mô tả
                </th>
                <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[90px] text-center whitespace-nowrap">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant bg-white">
              {paginatedServices.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-on-surface-variant font-medium"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Layers className="w-10 h-10 text-on-surface-variant/40" />
                      <span>
                        {search
                          ? "Không tìm thấy dịch vụ phù hợp."
                          : "Chưa có dịch vụ nào trong hệ thống."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedServices.map((service, idx) => (
                  <tr
                    key={service.service_id}
                    className="hover:bg-surface-container transition-colors group"
                  >
                    {/* STT */}
                    <td className="px-6 py-4 text-center text-on-surface-variant font-mono text-[13px] whitespace-nowrap">
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>

                    {/* Service Name */}
                    <td className="px-6 py-4 min-w-[200px]">
                      <span className="font-semibold text-[#1f1f1f] text-[14px] leading-snug">
                        {service.name}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 min-w-[260px]">
                      <span className="text-on-surface-variant text-[13px] line-clamp-2">
                        {service.description || (
                          <span className="italic text-on-surface-variant/50">
                            Không có mô tả
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(service)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low">
          <p className="text-on-surface-variant text-sm font-medium">
            Hiển thị{" "}
            {filteredServices.length === 0
              ? 0
              : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
            -{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredServices.length)}{" "}
            trên {filteredServices.length} kết quả
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || filteredServices.length === 0}
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === num
                    ? "border-primary bg-primary text-white"
                    : "border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages <= 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Create/Edit Service Modal ─────────────────────────────────────────── */}
      {showModal && (
        <ServiceFormDialog
          mode={modalMode}
          service={selectedService}
          onClose={() => setShowModal(false)}
          onSuccess={(msg) => {
            setShowModal(false);
            loadData(false);
            if (msg) setToastMessage({ text: msg, type: "success" });
          }}
        />
      )}

      {/* ─── Delete Confirmation Modal ─────────────────────────────────────── */}
      {showDeleteModal && serviceToDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !submittingDelete && setShowDeleteModal(false)} 
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden text-center p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-[#0b1c30] mb-2 font-headline">
              Xóa dịch vụ
            </h3>
            <p className="text-sm text-[#434751] mb-6">
              Bạn có chắc chắn muốn xóa dịch vụ <span className="font-semibold text-[#0b1c30]">"{serviceToDelete.name}"</span>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={submittingDelete}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#434751] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                disabled={submittingDelete}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submittingDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-[999] animate-in fade-in slide-in-from-bottom-5 duration-300">
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold leading-normal">
            {toastMessage.text}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
