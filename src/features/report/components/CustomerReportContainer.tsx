import React, { useState, useEffect } from "react";
import { ClipboardList, Plus, CheckCircle, X } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
// Removed requestGetCustomerContracts import from contract api
import { createClient } from "@/lib/supabase/client";
import { Contract } from "@/types/Contract";
import { Report, ReportType } from "../types";
import { CustomerReportFilters } from "./CustomerReportFilters";
import { CustomerReportTable } from "./CustomerReportTable";
import { CustomerReportForm } from "./CustomerReportForm";
import { CustomerReportDetailModal } from "./CustomerReportDetailModal";
import {
  requestGetCustomerReports,
  requestCreateReport,
  requestGetCustomerContractsForReport,
} from "../api/report.api";
import { useTranslation } from "@/components/providers/LanguageProvider";

export function CustomerReportContainer() {
  const customerId = useAuthStore((state) => state.user_id) || "";
  const { dict } = useTranslation();

  // UI state
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data state
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);

  // Form & Interaction state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Fetch reports from API
  const fetchReports = async () => {
    if (!customerId) return;
    setIsLoadingReports(true);
    try {
      const result = await requestGetCustomerReports({
        customerId,
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        type: filterType !== "ALL" ? filterType : undefined,
      });
      setReports(result.reports || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách báo cáo:", err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [customerId, searchQuery, filterType, filterStatus]);

  // Fetch customer contracts
  useEffect(() => {
    if (!customerId) return;
    async function fetchContracts() {
      setIsLoadingContracts(true);
      try {
        const result = await requestGetCustomerContractsForReport(customerId);
        setContracts(result.contracts || []);
      } catch (err) {
        console.error("Lỗi khi lấy hợp đồng:", err);
      } finally {
        setIsLoadingContracts(false);
      }
    }
    fetchContracts();
  }, [customerId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFormSubmit = async (payload: {
    contractId: string;
    type: ReportType;
    description: string;
    imageUrl: string | null;
    imageFile?: File | null;
  }) => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = payload.imageUrl;

      if (payload.imageFile) {
        const supabase = createClient();
        const fileExt = payload.imageFile.name.split(".").pop();
        const fileName = `${customerId}/${Date.now()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from("report")
          .upload(fileName, payload.imageFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Lỗi tải ảnh lên storage: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("report")
          .getPublicUrl(data.path);

        finalImageUrl = publicUrl;
      }

      await requestCreateReport({
        customer_id: customerId,
        contract_id: payload.contractId,
        type: payload.type,
        description: payload.description,
        image_url: finalImageUrl,
      });
      showToast(dict.report.container.success);
      setActiveTab("list");
      fetchReports();
    } catch (err) {
      console.error("Lỗi khi gửi báo cáo:", err);
      const errMsg = err instanceof Error ? err.message : dict.report.container.error;
      showToast(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto w-full px-6 space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight font-headline">
              {dict.report.container.title}
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5 font-body">
              {dict.report.container.desc}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 bg-surface-container rounded-lg p-1 border border-outline-variant/30 self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeTab === "list"
                ? "bg-white text-primary shadow-xs"
                : "text-on-surface-variant hover:text-primary"
              }`}
          >
            {dict.report.container.tab_history}
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "create"
                ? "bg-white text-primary shadow-xs"
                : "text-on-surface-variant hover:text-primary"
              }`}
          >
            <Plus className="w-3.5 h-3.5" /> {dict.report.container.tab_create}
          </button>
        </div>
      </div>

      {/* ================= TAB 1: LIST ================= */}
      {activeTab === "list" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <CustomerReportFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          {isLoadingReports ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white border border-outline-variant/30 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-xs text-on-surface-variant mt-3 font-medium">{dict.report.container.loading}</p>
            </div>
          ) : (
            <CustomerReportTable
              reports={reports}
              onViewDetail={setSelectedReport}
            />
          )}
        </div>
      )}

      {/* ================= TAB 2: CREATE ================= */}
      {activeTab === "create" && (
        <div className="animate-in fade-in duration-200">
          <CustomerReportForm
            contracts={contracts}
            isLoadingContracts={isLoadingContracts}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => setActiveTab("list")}
          />
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <CustomerReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
