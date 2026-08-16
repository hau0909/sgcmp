"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Users, Search, X, Loader2, UserRound, Phone, Mail, Check, Lock, Plus, ChevronLeft, ChevronRight, Info, Award, IdCard, Activity } from "lucide-react";
import { requestGetAllGuards, requestGetGuardsByContract } from "@/features/guards/api/guard.api";
import { requestAssignGuardsToContract } from "../api/contract.api";
import type { GuardListItem } from "@/features/guards/type";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface ContractGuardsInfoProps {
  contractId: string;
  customerAgreed: boolean;
  onGuardsUpdated?: (newGuardIds: string[]) => void;
}

const formatGender = (gender: string | null | undefined, dict: any) => {
  const g = gender?.trim().toLowerCase() || "";
  if (g === "male" || g === "nam") {
    return { label: dict.contract_guards?.male || "Nam", className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" };
  }
  if (g === "female" || g === "nữ" || g === "nư") {
    return { label: dict.contract_guards?.female || "Nữ", className: "bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300" };
  }
  return { label: dict.contract_guards?.other || "Khác", className: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300" };
};

export function ContractGuardsInfo({ contractId, customerAgreed, onGuardsUpdated }: ContractGuardsInfoProps) {
  const { dict } = useTranslation();
  const [assignedGuards, setAssignedGuards] = useState<GuardListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allGuards, setAllGuards] = useState<GuardListItem[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedGuardIds, setSelectedGuardIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [hoveredGuardInfo, setHoveredGuardInfo] = useState<{
    guard: GuardListItem;
    x: number;
    y: number;
  } | null>(null);

  // Pagination for all guards selection in modal
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const MODAL_PAGE_SIZE = 6;

  const fetchAssignedGuards = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await requestGetGuardsByContract({ contractId, page: 1, limit: 100 });
      if (res && res.success) {
        setAssignedGuards(res.data?.guards || []);
      }
    } catch (err) {
      console.error(dict.contract_guards?.error_load_assigned || "Lỗi khi tải danh sách bảo vệ của hợp đồng:", err);
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      const timer = setTimeout(() => {
        fetchAssignedGuards();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [contractId, fetchAssignedGuards]);



  // Fetch all guards of the company for selection in modal
  useEffect(() => {
    if (!isModalOpen) return;

    const fetchAllGuards = async () => {
      try {
        setIsLoadingAll(true);
        const res = await requestGetAllGuards({
          page: modalPage,
          limit: MODAL_PAGE_SIZE,
          status: "active",
          approvalStatus: "approved",
          search: searchKeyword,
          checkContractId: contractId,
        });
        if (res && res.success) {
          setAllGuards(res.data?.guards || []);
          setModalTotalPages(res.data?.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error(dict.contract_guards?.error_load_all || "Lỗi khi tải danh sách tất cả bảo vệ:", err);
      } finally {
        setIsLoadingAll(false);
      }
    };

    const timer = setTimeout(fetchAllGuards, 300);
    return () => clearTimeout(timer);
  }, [isModalOpen, searchKeyword, modalPage]);

  // Open modal and pre-fill selection
  const handleOpenModal = () => {
    const currentIds = assignedGuards.map((g) => g.guard_id);
    setSelectedGuardIds(currentIds);
    setSearchKeyword("");
    setModalPage(1);
    setIsModalOpen(true);
  };

  const handleToggleGuard = (guardId: string) => {
    setSelectedGuardIds((prev) =>
      prev.includes(guardId) ? prev.filter((id) => id !== guardId) : [...prev, guardId]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await requestAssignGuardsToContract(contractId, selectedGuardIds);
      if (res && res.success) {
        setToastMessage({ text: dict.contract_guards?.success_update || "Cập nhật danh sách bảo vệ thành công!", type: "success" });
        await fetchAssignedGuards();
        if (onGuardsUpdated) {
          onGuardsUpdated(selectedGuardIds);
        }
        setIsModalOpen(false);
      } else {
        setToastMessage({ text: res.message || dict.contract_guards?.error_generic || "Có lỗi xảy ra.", type: "error" });
      }
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as Error & { message?: string };
      setToastMessage({ text: errorObj?.message || dict.contract_guards?.error_save || "Có lỗi xảy ra khi lưu.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const getGuardProfile = (profiles: GuardListItem["profiles"]) => {
    if (!profiles) return null;
    return Array.isArray(profiles) ? (profiles[0] ?? null) : profiles;
  };

  const getIdentityId = (profiles: GuardListItem["profiles"]): string => {
    const p = getGuardProfile(profiles);
    if (!p) return "";
    if (Array.isArray(p.identities) && p.identities.length > 0) {
      return p.identities[0].identity_id;
    }
    if (p.identities && typeof p.identities === "object" && "identity_id" in p.identities) {
      return (p.identities as any).identity_id || "";
    }
    return "";
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative flex-grow flex-shrink min-w-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-[999] animate-in fade-in slide-in-from-bottom-5 ${toastMessage.type === "success" ? "bg-emerald-950 text-emerald-200 border border-emerald-800" : "bg-red-950 text-red-200 border border-red-800"
          }`}>
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Decorative top-right curved background circle */}
      <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden rounded-xl pointer-events-none">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/30 pb-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-headline">
            <Users className="w-5 h-5 text-primary" />
            <span>{dict.contract_guards?.title || "Phân công bảo vệ"}</span>
            {/* Info tooltip: guard assignment is optional */}
            <div className="relative group/info flex items-center">
              <button
                type="button"
                className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-blue-500 transition-colors cursor-default"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <div className="absolute left-0 top-6 pointer-events-none opacity-0 group-hover/info:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-[11px] font-medium px-3 py-2 rounded-lg shadow-xl z-[9999] w-64 leading-relaxed">
                <div className="absolute -top-1.5 left-3 border-4 border-transparent border-b-slate-800" />
                <p className="font-semibold text-blue-300 mb-1">ℹ️ {dict.contract_guards?.info_optional_title || "Phân công bảo vệ không bắt buộc"}</p>
                <p>{dict.contract_guards?.info_optional_desc || "Bạn có thể ký hợp đồng ngay cả khi chưa phân công. Việc điều phối bảo vệ có thể thực hiện sau khi hợp đồng có hiệu lực."}</p>
              </div>
            </div>
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 font-body">
            {dict.contract_guards?.desc || "Danh sách nhân sự bảo vệ phụ trách hợp đồng này."}
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2 cursor-pointer bg-primary hover:bg-primary/95 text-on-primary text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{dict.contract_guards?.update_btn || "Cập nhật bảo vệ"}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : assignedGuards.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-outline-variant/50 rounded-xl bg-surface-container-low/30">
          <UserRound className="w-10 h-10 text-outline-variant mx-auto mb-2.5" />
          <p className="text-sm font-semibold text-on-surface">{dict.contract_guards?.no_guards || "Chưa phân công bảo vệ"}</p>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xs mx-auto">
            {dict.contract_guards?.no_guards_desc_unlocked || "Vui lòng nhấn nút cập nhật ở trên để phân công nhân sự bảo vệ cho hợp đồng này."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 max-h-[400px] overflow-y-auto pr-1">
          {assignedGuards.map((guard) => {
            const profile = getGuardProfile(guard.profiles);
            if (!profile) return null;

            return (
              <div
                key={guard.guard_id}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredGuardInfo({
                    guard,
                    x: rect.left,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setHoveredGuardInfo(null)}
                className="flex items-center gap-3.5 p-3 rounded-lg border border-outline-variant/60 bg-surface-container-low/40 hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || ""}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border border-outline-variant"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                    <UserRound className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-on-surface truncate">
                    {profile.full_name || dict.contract_guards?.unnamed_guard || "Bảo vệ không tên"}
                  </h4>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {profile.phone_number && (
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <Phone className="w-3 h-3 shrink-0" />
                        {profile.phone_number}
                      </span>
                    )}
                    {profile.email && (
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1 truncate font-mono">
                        <Mail className="w-3 h-3 shrink-0" />
                        {profile.email}
                      </span>
                    )}
                  </div>
                  {/* Notable Skills Chip */}
                  {Array.isArray(guard.notable_skills) && guard.notable_skills.length > 0 && (
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300">
                        <Award className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{guard.notable_skills[0]}</span>
                      </span>
                      {guard.notable_skills.length > 1 && (
                        <span className="inline-flex items-center rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                          +{guard.notable_skills.length - 1}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  {(() => {
                    const genderInfo = formatGender(profile.gender, dict);
                    return (
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${genderInfo.className}`}>
                        {genderInfo.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SELECT GUARDS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#c3c6d3] max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-[#eff4ff] border-b border-[#acc7ff] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#024594]">
                <Users className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">{dict.contract_guards?.modal_title || "Cập nhật danh sách bảo vệ"}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={dict.contract_guards?.search_placeholder || "Tìm kiếm bảo vệ theo tên, số điện thoại, email..."}
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setModalPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Modal Body - Guard Pool List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[250px]">
              {isLoadingAll ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : allGuards.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-sm">
                  {dict.contract_guards?.no_guards_found || "Không tìm thấy nhân viên bảo vệ hoạt động nào phù hợp."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {allGuards.map((guard) => {
                    const profile = getGuardProfile(guard.profiles);
                    if (!profile) return null;
                    const isSelected = selectedGuardIds.includes(guard.guard_id);
                    const isConflicted = !!guard.conflictInfo?.hasConflict;

                    return (
                      <div
                        key={guard.guard_id}
                        onClick={() => {
                          if (isConflicted) return;
                          handleToggleGuard(guard.guard_id);
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredGuardInfo({
                            guard,
                            x: rect.left,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredGuardInfo(null)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all select-none ${isConflicted
                            ? "border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed"
                            : isSelected
                              ? "border-primary bg-primary/5 shadow-sm cursor-pointer"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer"
                          }`}
                      >
                        {/* Custom Checkbox */}
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isConflicted
                            ? "border-slate-200 bg-slate-100 text-slate-300"
                            : isSelected
                              ? "bg-primary border-primary text-on-primary"
                              : "border-slate-300 bg-white"
                          }`}>
                          {!isConflicted && isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </div>

                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={profile.full_name || ""}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                            <UserRound className="w-4 h-4" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {profile.full_name || dict.contract_guards?.unnamed || "Không tên"}
                          </p>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <span className="text-xs text-slate-500 truncate">
                              {profile.phone_number || dict.contract_guards?.no_phone || "Không có SĐT"}
                            </span>
                            {profile.email && (
                              <span className="text-[11px] text-slate-400 font-mono truncate">
                                {profile.email}
                              </span>
                            )}
                            {/* Notable Skills Chip */}
                            {Array.isArray(guard.notable_skills) && guard.notable_skills.length > 0 && (
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                                  <Award className="w-3 h-3 text-blue-600 shrink-0" />
                                  <span className="truncate max-w-[130px]">{guard.notable_skills[0]}</span>
                                </span>
                                {guard.notable_skills.length > 1 && (
                                  <span className="inline-flex items-center rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[11px] font-bold text-slate-700">
                                    +{guard.notable_skills.length - 1}
                                  </span>
                                )}
                              </div>
                            )}
                            {guard.conflictInfo && (
                              <div className="mt-0.5">
                                {guard.conflictInfo.hasConflict ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
                                    {dict.contract_guards?.status_conflict || "Trùng lịch hợp đồng"} #{guard.conflictInfo.conflictContractCode || guard.conflictInfo.reason}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                                    {dict.contract_guards?.status_free || "Rảnh"}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Pagination Controls */}
            {modalTotalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalPage((p) => Math.max(p - 1, 1))}
                  disabled={modalPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  {dict.contract_guards?.page || "Trang"} {modalPage} / {modalTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setModalPage((p) => Math.min(p + 1, modalTotalPages))}
                  disabled={modalPage === modalTotalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="text-xs font-semibold text-slate-600">
                {dict.contract_guards?.selected || "Đã chọn:"} <span className="text-primary font-bold">{selectedGuardIds.length}</span> {dict.contract_guards?.guards_count || "nhân sự"}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded-lg text-sm font-semibold text-slate-700 cursor-pointer"
                  disabled={isSaving}
                >
                  {dict.contract_guards?.cancel || "Hủy bỏ"}
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-on-primary font-bold rounded-lg text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{dict.contract_guards?.save_changes || "Lưu thay đổi"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Hover Details Popover Card */}
      {hoveredGuardInfo && (
        <div
          className="fixed z-[99999] w-80 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 text-left"
          style={{
            top: `${Math.max(16, Math.min(window.innerHeight - 380, hoveredGuardInfo.y - 15))}px`,
            left: `${hoveredGuardInfo.x > 340 ? hoveredGuardInfo.x - 332 : hoveredGuardInfo.x + 360}px`,
          }}
        >
          {(() => {
            const p = getGuardProfile(hoveredGuardInfo.guard.profiles);
            const cccd = getIdentityId(hoveredGuardInfo.guard.profiles);
            const skills = Array.isArray(hoveredGuardInfo.guard.notable_skills)
              ? hoveredGuardInfo.guard.notable_skills
              : [];
            const unupdatedText =
              dict?.create_shift_modal?.guard_tooltip_unupdated ||
              (dict?.coor_guards?.unupdated || "Chưa cập nhật");
            return (
              <div className="space-y-3">
                {/* Header with Avatar & Name */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-blue-600 bg-slate-100 shadow-sm">
                    {p?.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        alt={p.full_name || "Guard"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <UserRound size={24} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-bold text-sm text-slate-900">
                      {p?.full_name || unupdatedText}
                    </h4>
                    <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200/60">
                      {dict?.create_shift_modal?.guard_tooltip_approved || "Bảo vệ đã duyệt"}
                    </span>
                  </div>
                </div>

                {/* Contact & CCCD Info */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <IdCard size={14} className="text-blue-700 shrink-0" />
                    <span className="text-slate-500 font-medium">
                      {dict?.create_shift_modal?.guard_tooltip_cccd || "CCCD:"}
                    </span>
                    <span className="font-semibold text-slate-900">{cccd || unupdatedText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-blue-700 shrink-0" />
                    <span className="text-slate-500 font-medium">
                      {dict?.create_shift_modal?.guard_tooltip_phone || "SĐT:"}
                    </span>
                    <span className="font-medium text-slate-900">{p?.phone_number || unupdatedText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-blue-700 shrink-0" />
                    <span className="text-slate-500 font-medium">
                      {dict?.create_shift_modal?.guard_tooltip_email || "Email:"}
                    </span>
                    <span className="truncate font-medium text-slate-900">{p?.email || unupdatedText}</span>
                  </div>
                  {(hoveredGuardInfo.guard.height_cm || hoveredGuardInfo.guard.weight_kg) && (
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-blue-700 shrink-0" />
                      <span className="text-slate-500 font-medium">
                        {dict?.create_shift_modal?.guard_tooltip_physical || "Thể chất:"}
                      </span>
                      <span className="font-medium text-slate-900">
                        {hoveredGuardInfo.guard.height_cm ? `${hoveredGuardInfo.guard.height_cm} cm` : "—"} · {hoveredGuardInfo.guard.weight_kg ? `${hoveredGuardInfo.guard.weight_kg} kg` : "—"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notable Skills */}
                <div className="border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Award size={13} className="text-blue-700" />
                    <span>
                      {(dict?.create_shift_modal?.guard_tooltip_skills || "Kỹ năng nổi bật ({0}):").replace("{0}", String(skills.length))}
                    </span>
                  </div>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-900"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      {dict?.create_shift_modal?.guard_tooltip_no_skills || "Chưa cập nhật kỹ năng."}
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
