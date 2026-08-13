"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    RefreshCw,
    FileText,
    AlertCircle,
    Clock,
    User,
    Radio,
    ChevronDown,
    Sparkles,
    Calendar,
    Check,
    X,
    Search,
    CheckCircle2,
    Phone,
    MapPin,
    Award,
    IdCard,
    Mail,
    Activity,
} from "lucide-react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { CreateShiftModal } from "@/features/shift/components/CreateShiftModal";
import {
    requestGetCoordinatorReportStats,
    requestGetPastShifts,
    requestGetAvailableGuards,
    requestGetGuardPerformanceRadar,
    type CurrentUpcomingShiftItem,
    type PastShiftItem,
    type AvailableGuardItem,
    type GuardPerformanceRadarItem,
} from "@/features/dashboard/api/dashboard.api";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/components/providers/LanguageProvider";

export default function CoordinatorDashboardPage() {
    const { dict, locale } = useTranslation();
    const t = (dict as any)?.coor_dashboard || {};
    const isEn = locale === "en";

    const getTranslatedStatusText = (statusText: string) => {
        if (!statusText) return "";
        const s = statusText.toUpperCase();
        if (s.includes("ĐIỂM DANH TRỄ")) return isEn ? "LATE CHECK-IN" : "ĐIỂM DANH TRỄ";
        if (s.includes("ĐI TRỄ CHƯA ĐIỂM DANH") || s.includes("CHƯA ĐIỂM DANH")) return isEn ? "LATE - NOT CHECKED IN" : "ĐI TRỄ CHƯA ĐIỂM DANH";
        if (s.includes("ĐANG TRỰC") || s.includes("ONGOING") || s.includes("ON DUTY")) return t.status_ongoing || "ĐANG TRỰC";
        if (s.includes("PHÂN CÔNG") || s.includes("ASSIGNED")) return t.status_assigned || "PHÂN CÔNG";
        if (s.includes("ĐI TRỄ") || s.includes("LATE")) return t.status_late || "ĐI TRỄ";
        if (s.includes("VẮNG MẶT") || s.includes("ABSENT")) return t.status_absent || "VẮNG MẶT";
        if (s.includes("THAY CA") || s.includes("THAY THẾ") || s.includes("REPLACEMENT") || s.includes("SHIFT CHANGE")) return t.status_replacement || "THAY CA";
        if (s.includes("HOÀN THÀNH") || s.includes("ĐÃ KẾT THÚC") || s.includes("KẾT THÚC") || s.includes("CHECKOUT") || s.includes("COMPLETED")) return t.status_checkout || "HOÀN THÀNH";
        return statusText;
    };

    const getTranslatedTimeText = (timeText: string) => {
        if (!timeText) return "";
        if (isEn) {
            return timeText
                .replace(/Kết thúc lúc:/g, "Ends at:")
                .replace(/Trễ ca \(Bắt đầu/g, "Late (Started")
                .replace(/Bắt đầu:/g, "Starts at:")
                .replace(/Thay ca \(/g, "Replacement (")
                .replace(/Thay ca cho/g, "Replacement for")
                .replace(/Vắng mặt ca/g, "Absent shift");
        }
        return timeText;
    };

    const getTranslatedCerts = (certs: string) => {
        if (!certs) return "";
        if (isEn) {
            return certs
                .replace(/^CN:/g, "Skills:")
                .replace(/Tuần tra/g, "Patrol")
                .replace(/Sơ cứu/g, "First Aid");
        }
        return certs;
    };

    const [isCreateShiftOpen, setIsCreateShiftOpen] = useState(false);
    const [isPastShiftsModalOpen, setIsPastShiftsModalOpen] = useState(false);
    const [isAvailableGuardsModalOpen, setIsAvailableGuardsModalOpen] = useState(false);
    const [isCurrentUpcomingModalOpen, setIsCurrentUpcomingModalOpen] = useState(false);
    const [modalSearchKeyword, setModalSearchKeyword] = useState("");
    const [guardSearchKeyword, setGuardSearchKeyword] = useState("");
    const [currentUpcomingSearchKeyword, setCurrentUpcomingSearchKeyword] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timeFilter, setTimeFilter] = useState<"homnay" | "homqua" | "tuantruoc" | "thangtruoc">("homnay");
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // API Dynamic States
    const [totalReportsCount, setTotalReportsCount] = useState<number>(0);
    const [unresolvedReportsCount, setUnresolvedReportsCount] = useState<number>(0);
    const [currentUpcomingShiftsList, setCurrentUpcomingShiftsList] = useState<CurrentUpcomingShiftItem[]>([]);
    const [pastShiftsList, setPastShiftsList] = useState<PastShiftItem[]>([]);
    const [availableGuardsList, setAvailableGuardsList] = useState<AvailableGuardItem[]>([]);
    const [hoveredGuardInfo, setHoveredGuardInfo] = useState<{
        guard: AvailableGuardItem;
        x: number;
        y: number;
    } | null>(null);
    const [performanceRadarData, setPerformanceRadarData] = useState<GuardPerformanceRadarItem[]>([
        { subject: t.status_ongoing || (isEn ? "ON DUTY" : "Đang trực"), score: 0, count: "0 ca", badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80" },
        { subject: dict?.common?.overtime || (isEn ? "OVERTIME" : "TĂNG CA"), score: 0, count: "0 ca", badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80" },
        { subject: t.status_late || (isEn ? "LATE" : "Đi trễ"), score: 0, count: "0 ca", badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80" },
        { subject: t.status_absent || (isEn ? "ABSENT" : "Vắng mặt"), score: 0, count: "0 ca", badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80" },
        { subject: t.status_replacement || (isEn ? "REPLACEMENT" : "Thay ca"), score: 0, count: "0 ca", badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80" },
    ]);
    const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

    // Unified Status Color Badge Mapper
    const getStatusBadgeStyle = (status: string) => {
        const s = status.toUpperCase();
        if (
            s.includes("ĐANG TRỰC") ||
            s.includes("COMPLETED") ||
            s.includes("ONGOING") ||
            s.includes("ON DUTY") ||
            s.includes("SẮN SÀNG") ||
            s.includes("ĐANG RẢNH")
        ) {
            return "bg-emerald-100 text-emerald-700 border-emerald-200/80"; // Green (Xanh lá - Đang trực)
        }
        if (s.includes("CHECKOUT") || s.includes("ĐÃ KẾT THÚC") || s.includes("KẾT THÚC") || s.includes("ENDED")) {
            return "bg-slate-100 text-slate-700 border-slate-200/80"; // Gray (Đã kết thúc)
        }
        if (s.includes("VẮNG MẶT") || s.includes("CHƯA GIẢI QUYẾT") || s.includes("ABSENT")) {
            return "bg-rose-100 text-rose-700 border-rose-200/80"; // Red (Màu đỏ)
        }
        if (s.includes("ĐIỂM DANH TRỄ")) {
            return "bg-yellow-100 text-yellow-800 border-yellow-300"; // Vibrant Yellow (Màu vàng)
        }
        if (s.includes("ĐI TRỄ") || s.includes("LATE")) {
            return "bg-amber-100 text-amber-800 border-amber-300"; // Amber (Màu cam/amber)
        }
        if (s.includes("THAY CA") || s.includes("THAY THẾ") || s.includes("REPLACEMENT") || s.includes("SHIFT CHANGE")) {
            return "bg-purple-100 text-purple-700 border-purple-200/80"; // Purple (Màu tím)
        }
        if (s.includes("PHÂN CÔNG") || s.includes("SẮP TỚI") || s.includes("UPCOMING") || s.includes("ASSIGNED")) {
            return "bg-blue-100 text-blue-700 border-blue-200/80"; // Blue (Màu xanh biển)
        }
        return "bg-slate-100 text-slate-700 border-slate-200/80";
    };

    // Render exact small icon according to status type or time text
    const renderStatusIcon = (statusText: string, timeText?: string) => {
        const s = statusText.toUpperCase();
        const tStr = (timeText || "").toUpperCase();

        if (tStr.includes("KẾT THÚC") || tStr.includes("ENDED") || s.includes("KẾT THÚC")) {
            return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
        }
        if (s.includes("ĐANG TRỰC") || s.includes("ONGOING") || s.includes("ON DUTY")) {
            return <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />;
        }
        if (s.includes("HOÀN THÀNH") || s.includes("HOÀN TẤT") || s.includes("COMPLETED")) {
            return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
        }
        if (s.includes("VẮNG MẶT") || s.includes("ABSENT")) {
            return <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
        }
        if (s.includes("ĐI TRỄ") || s.includes("LATE")) {
            return <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
        }
        if (s.includes("THAY CA") || s.includes("REPLACEMENT")) {
            return <RefreshCw className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
        }
        return <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    };

    const getTimeFilterLabel = (filter: string) => {
        switch (filter) {
            case "hientai":
                return t.filter_hientai || "Hiện tại";
            case "homnay":
                return t.filter_homnay || "Hôm nay";
            case "homqua":
                return t.filter_homqua || "Hôm qua";
            case "tuantruoc":
                return t.filter_tuantruoc || "Tuần trước";
            case "thangtruoc":
                return t.filter_thangtruoc || "Tháng trước";
            default:
                return t.filter_homnay || "Hôm nay";
        }
    };

    const companyId = useAuthStore((state) => state.company_id) || undefined;

    // Fetch All Dynamic Data from API endpoints
    const fetchDashboardData = useCallback(async (filter: string) => {
        setIsLoadingStats(true);
        try {
            const clientDate = new Date().toISOString();
            const [reportStatsData, pastShiftsData, availableGuardsData, radarData] = await Promise.all([
                requestGetCoordinatorReportStats(companyId, "homnay", clientDate),
                requestGetPastShifts(companyId, filter, clientDate),
                requestGetAvailableGuards(companyId, clientDate),
                requestGetGuardPerformanceRadar(companyId, filter, clientDate),
            ]);

            if (reportStatsData) {
                if (reportStatsData.totalReports !== undefined) setTotalReportsCount(reportStatsData.totalReports);
                if (reportStatsData.unresolvedReports !== undefined) setUnresolvedReportsCount(reportStatsData.unresolvedReports);
                if (reportStatsData.currentUpcomingShifts) setCurrentUpcomingShiftsList(reportStatsData.currentUpcomingShifts);
            }

            if (pastShiftsData) setPastShiftsList(pastShiftsData);
            if (availableGuardsData) setAvailableGuardsList(availableGuardsData);
            if (radarData && radarData.length > 0) {
                // Translate radar subjects
                const translatedRadar = radarData.map((item) => {
                    let sub = item.subject;
                    if (sub === "Đang trực") sub = t.status_ongoing || (isEn ? "ON DUTY" : "Đang trực");
                    else if (sub === "TĂNG CA" || sub === "Tăng ca") sub = dict?.common?.overtime || (isEn ? "OVERTIME" : "TĂNG CA");
                    else if (sub === "Đi trễ") sub = t.status_late || (isEn ? "LATE" : "Đi trễ");
                    else if (sub === "Vắng mặt") sub = t.status_absent || (isEn ? "ABSENT" : "Vắng mặt");
                    else if (sub === "Thay ca") sub = t.status_replacement || (isEn ? "REPLACEMENT" : "Thay ca");
                    return { ...item, subject: sub };
                });
                setPerformanceRadarData(translatedRadar);
            }
        } catch (error) {
            console.error("[CoordinatorDashboard] fetchDashboardData error:", error);
        } finally {
            setIsLoadingStats(false);
        }
    }, [companyId, t]);

    useEffect(() => {
        setMounted(true);
        const now = new Date();
        const formatted = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} | ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        setLastUpdated(formatted);
        fetchDashboardData(timeFilter);
    }, [timeFilter, fetchDashboardData]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchDashboardData(timeFilter);
        setTimeout(() => {
            const now = new Date();
            setLastUpdated(
                `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} | ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
            );
            setIsRefreshing(false);
            showToast(t.toast_refresh_success || "Dữ liệu đã được làm mới thành công!");
        }, 600);
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const getShiftTimeValue = (shift: { startTime?: string; timeText?: string; time?: string }) => {
        if (shift.startTime) {
            const t = new Date(shift.startTime).getTime();
            if (!isNaN(t) && t > 0) return t;
        }
        const str = shift.timeText || shift.time || "";
        const match = str.match(/(\d{1,2}):(\d{2})/);
        if (match) {
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            return hours * 60 + minutes;
        }
        return 0;
    };

    const sortedPastShifts = [...pastShiftsList].sort(
        (a, b) => getShiftTimeValue(b) - getShiftTimeValue(a)
    );

    const filteredPastShifts = sortedPastShifts.filter((shift) => {
        const query = modalSearchKeyword.toLowerCase().trim();
        if (!query) return true;
        return (
            shift.name.toLowerCase().includes(query) ||
            shift.location.toLowerCase().includes(query) ||
            (shift.contractName && shift.contractName.toLowerCase().includes(query)) ||
            (shift.phone && shift.phone.toLowerCase().includes(query)) ||
            shift.id.toLowerCase().includes(query) ||
            shift.status.toLowerCase().includes(query)
        );
    });

    const filteredAvailableGuards = availableGuardsList.filter((guard) => {
        const query = guardSearchKeyword.toLowerCase().trim();
        if (!query) return true;
        return (
            guard.name.toLowerCase().includes(query) ||
            (guard.phone && guard.phone.toLowerCase().includes(query)) ||
            guard.certs.toLowerCase().includes(query) ||
            guard.id.toLowerCase().includes(query)
        );
    });

    const sortedCurrentUpcomingShifts = [...currentUpcomingShiftsList].sort(
        (a, b) => getShiftTimeValue(a) - getShiftTimeValue(b)
    );

    const filteredCurrentUpcomingShifts = sortedCurrentUpcomingShifts.filter((shift) => {
        const query = currentUpcomingSearchKeyword.toLowerCase().trim();
        if (!query) return true;
        return (
            shift.name.toLowerCase().includes(query) ||
            shift.location.toLowerCase().includes(query) ||
            (shift.phone && shift.phone.toLowerCase().includes(query)) ||
            shift.id.toLowerCase().includes(query) ||
            shift.statusText.toLowerCase().includes(query)
        );
    });

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#f8fafc] min-h-screen text-slate-800 antialiased">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-medium">{toastMessage}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {t.title || "Bảng Điều Phối Trung Tâm"}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                        {t.last_updated || "Cập nhật lần cuối:"} {lastUpdated}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Custom Time Filter Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                            className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer"
                        >
                            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{getTimeFilterLabel(timeFilter)}</span>
                            <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isFilterDropdownOpen ? "rotate-180 text-blue-600" : ""
                                    }`}
                            />
                        </button>

                        {/* Custom Floating Popover Dropdown */}
                        {isFilterDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsFilterDropdownOpen(false)}
                                />
                                <div className="absolute right-0 top-11 z-50 w-44 rounded-2xl border border-slate-200/90 bg-white shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    {[
                                        { id: "homnay", label: t.filter_homnay || "Hôm nay" },
                                        { id: "homqua", label: t.filter_homqua || "Hôm qua" },
                                        { id: "tuantruoc", label: t.filter_tuantruoc || "Tuần trước" },
                                        { id: "thangtruoc", label: t.filter_thangtruoc || "Tháng trước" },
                                    ].map((option) => {
                                        const isSelected = timeFilter === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => {
                                                    setTimeFilter(option.id as any);
                                                    setIsFilterDropdownOpen(false);
                                                    showToast(`${t.toast_filter_changed || "Đã lọc theo:"} ${option.label}`);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${isSelected
                                                        ? "bg-blue-50 text-blue-700 font-bold"
                                                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                                    }`}
                                            >
                                                <span>{option.label}</span>
                                                {isSelected && (
                                                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/90 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
                        <span>{t.refresh_btn || "Làm mới dữ liệu"}</span>
                    </button>
                </div>
            </div>

            {/* Top 2 Stats Cards: BÁO CÁO TRONG NGÀY & BÁO CÁO CHƯA GIẢI QUYẾT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Card 1: BÁO CÁO HÔM NAY / TODAY REPORTS */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {t.card_total_reports || "BÁO CÁO HÔM NAY"}
                            </p>
                            <p className="text-3xl font-black text-slate-900 mt-0.5">
                                {isLoadingStats ? (
                                    <span className="inline-block w-12 h-7 bg-slate-200 rounded-md animate-pulse align-middle" />
                                ) : (
                                    totalReportsCount
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 2: BÁO CÁO CHƯA GIẢI QUYẾT */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {t.card_unresolved_reports || "BÁO CÁO CHƯA GIẢI QUYẾT"}
                            </p>
                            <p className="text-3xl font-black text-rose-600 mt-0.5">
                                {isLoadingStats ? (
                                    <span className="inline-block w-12 h-7 bg-rose-100 rounded-md animate-pulse align-middle" />
                                ) : (
                                    unresolvedReportsCount
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Left 2/3 + Right 1/3 with equal stretched column height */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Left Column (2 Cols on desktop) */}
                <div className="lg:col-span-2 flex flex-col justify-between gap-6">
                    {/* Card 1: Ca trực Hiện tại & Sắp tới (Max 3 items + Guard Avatar) */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                            <h2 className="text-base font-bold text-slate-900">
                                {t.card_current_upcoming_title || "Ca trực Hiện tại & Sắp tới"}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200/60">
                                {t.card_current_upcoming_badge || "Hiện tại & Sắp tới"}
                            </span>
                        </div>

                        {/* Display max 3 items */}
                        <div className="space-y-3">
                            {isLoadingStats ? (
                                Array.from({ length: 3 }).map((_, idx) => (
                                    <div key={idx} className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/60 animate-pulse flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="h-4 bg-slate-200 rounded-md w-36" />
                                                <div className="h-3 bg-slate-200 rounded-md w-24" />
                                            </div>
                                            <div className="h-3 bg-slate-200 rounded-md w-48" />
                                            <div className="flex items-center justify-between pt-1">
                                                <div className="h-4 bg-slate-200 rounded-md w-20" />
                                                <div className="h-3 bg-slate-200 rounded-md w-16" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                currentUpcomingShiftsList.length === 0 ? null : sortedCurrentUpcomingShifts.slice(0, 3).map((shift, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-xl p-4 transition-colors ${shift.type === "ONGOING"
                                                ? "bg-emerald-50/60 border-l-4 border-emerald-600 border-t border-r border-b border-slate-200/60"
                                                : "bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Guard Avatar on the far left */}
                                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-2xs mt-0.5 bg-slate-200 text-slate-600 flex items-center justify-center">
                                                {shift.avatar ? (
                                                    <img
                                                        src={shift.avatar}
                                                        alt={shift.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLElement).style.display = "none";
                                                            if ((e.target as HTMLElement).nextElementSibling) {
                                                                ((e.target as HTMLElement).nextElementSibling as HTMLElement).classList.remove("hidden");
                                                            }
                                                        }}
                                                    />
                                                ) : null}
                                                <User className={`w-5 h-5 text-slate-500 ${shift.avatar ? "hidden" : ""}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-slate-900 truncate">
                                                        {shift.name}
                                                    </h3>

                                                    <span className="flex items-center gap-1.5 text-xs shrink-0">
                                                        {renderStatusIcon(shift.statusText, shift.timeText)}
                                                        <span className={shift.type === "ONGOING" ? "text-emerald-700 font-extrabold" : "text-slate-600 font-semibold"}>
                                                            {getTranslatedTimeText(shift.timeText)}
                                                        </span>
                                                    </span>
                                                </div>

                                                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                                                    <span className="flex items-center gap-1 text-slate-600 font-semibold">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{shift.location}</span>
                                                    </span>
                                                    {shift.phone && (
                                                        <>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="flex items-center gap-1 text-slate-500 font-medium">
                                                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                                <span>{shift.phone}</span>
                                                            </span>
                                                        </>
                                                    )}
                                                </p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${getStatusBadgeStyle(shift.statusText)}`}
                                                        >
                                                            {getTranslatedStatusText(shift.statusText)}
                                                        </span>
                                                        {(shift.isOvertime || (Number(shift.overtimeMinutes) > 0)) && (
                                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border border-amber-300 bg-amber-100/90 text-amber-800">
                                                                {dict?.common?.overtime || "TĂNG CA"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                        ID: {shift.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {currentUpcomingShiftsList.length === 0 && !isLoadingStats && (
                                <div className="text-center py-6 text-xs text-slate-400">
                                    {t.no_current_upcoming_shifts || "Không có ca trực nào trong thời gian này."}
                                </div>
                            )}
                        </div>

                        {/* Footer button "Xem tất cả ca trực hiện tại & sắp tới" opens modal popup */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsCurrentUpcomingModalOpen(true)}
                                className="w-full py-2.5 px-4 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl text-center transition-colors cursor-pointer"
                            >
                                {t.view_all_current_upcoming || "Xem tất cả ca trực hiện tại & sắp tới"} ({currentUpcomingShiftsList.length})
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Các ca trực đã qua (Flex-1 to stretch down equally + Max 5 Items) */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                                <h2 className="text-base font-bold text-slate-900">
                                    {t.card_past_shifts_title_past || "Các ca trực đã qua"}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100/60">
                                    {getTimeFilterLabel(timeFilter)}
                                </span>
                            </div>

                            {/* Display max 5 items */}
                            <div className="space-y-3">
                                {isLoadingStats ? (
                                    Array.from({ length: 4 }).map((_, idx) => (
                                        <div key={idx} className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 animate-pulse flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="h-4 bg-slate-200 rounded-md w-32" />
                                                    <div className="h-3 bg-slate-200 rounded-md w-28" />
                                                </div>
                                                <div className="h-3 bg-slate-200 rounded-md w-44" />
                                                <div className="flex items-center gap-2 pt-1">
                                                    <div className="h-4 bg-slate-200 rounded-md w-16" />
                                                    <div className="h-3 bg-slate-200 rounded-md w-14" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    pastShiftsList.length === 0 ? null : sortedPastShifts.slice(0, 5).map((shift, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-slate-50/70 hover:bg-slate-100/80 rounded-xl p-3.5 border border-slate-100 transition-colors flex items-start gap-3"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden border border-slate-200">
                                                {shift.avatar ? (
                                                    <img
                                                        src={shift.avatar}
                                                        alt={shift.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLElement).style.display = "none";
                                                            if ((e.target as HTMLElement).nextElementSibling) {
                                                                ((e.target as HTMLElement).nextElementSibling as HTMLElement).classList.remove("hidden");
                                                            }
                                                        }}
                                                    />
                                                ) : null}
                                                <User className={`w-5 h-5 text-slate-500 ${shift.avatar ? "hidden" : ""}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-slate-900 truncate">
                                                        {shift.name}
                                                    </h3>
                                                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                                                        {renderStatusIcon(shift.status)}
                                                        <span>{shift.time}</span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5 flex-wrap">
                                                    <span>{shift.location}</span>
                                                    {shift.contractName && (
                                                        <>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="text-slate-600 font-semibold">{shift.contractName}</span>
                                                        </>
                                                    )}
                                                    {shift.phone && (
                                                        <>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="flex items-center gap-1 text-slate-500 font-medium">
                                                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                                <span>{shift.phone}</span>
                                                            </span>
                                                        </>
                                                    )}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${getStatusBadgeStyle(shift.status)}`}>
                                                            {getTranslatedStatusText(shift.status)}
                                                        </span>
                                                        {(shift.isOvertime || (Number(shift.overtimeMinutes) > 0)) && (
                                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border border-amber-300 bg-amber-100/90 text-amber-800">
                                                                {dict?.common?.overtime || "TĂNG CA"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                        ID: {shift.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {pastShiftsList.length === 0 && !isLoadingStats && (
                                    <div className="text-center py-6 text-xs text-slate-400">
                                        {t.no_past_shifts || "Không có ca trực nào trong thời gian này."}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer button "Xem thêm" opens modal popup */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsPastShiftsModalOpen(true)}
                                className="w-full py-2.5 px-4 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl text-center transition-colors cursor-pointer"
                            >
                                {t.view_more_past_shifts || "Xem thêm ca trực"} ({pastShiftsList.length})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Column (1 Col on desktop) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Card 1: Bảo vệ đang rảnh */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                            <h2 className="text-base font-bold text-slate-900">
                                {t.card_available_guards_title || "Bảo vệ rảnh thời điểm hiện tại"}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                                {t.card_available_guards_badge || "Hiện tại"}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {isLoadingStats ? (
                                Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                                            <div className="space-y-1.5">
                                                <div className="h-3.5 bg-slate-200 rounded-md w-28" />
                                                <div className="h-3 bg-slate-200 rounded-md w-36" />
                                            </div>
                                        </div>
                                        <div className="h-5 bg-slate-200 rounded-md w-16" />
                                    </div>
                                ))
                            ) : (
                                availableGuardsList.slice(0, 5).map((guard, idx) => (
                                    <div
                                        key={idx}
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setHoveredGuardInfo({ guard, x: rect.left, y: rect.top });
                                        }}
                                        onMouseLeave={() => setHoveredGuardInfo(null)}
                                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center text-slate-600">
                                                {guard.avatar ? (
                                                    <img
                                                        src={guard.avatar}
                                                        alt={guard.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLElement).style.display = "none";
                                                            if ((e.target as HTMLElement).nextElementSibling) {
                                                                ((e.target as HTMLElement).nextElementSibling as HTMLElement).classList.remove("hidden");
                                                            }
                                                        }}
                                                    />
                                                ) : null}
                                                <User className={`w-5 h-5 text-slate-500 ${guard.avatar ? "hidden" : ""}`} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                                                    {guard.name}
                                                </h3>
                                                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span>{guard.phone || (isEn ? "No phone" : "Chưa có SĐT")}</span>
                                                </p>
                                                {Array.isArray(guard.notable_skills) && guard.notable_skills.length > 0 && (
                                                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                                                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                                                            <Award size={10} className="text-blue-600 shrink-0" />
                                                            <span className="truncate max-w-[100px]">{guard.notable_skills[0]}</span>
                                                        </span>
                                                        {guard.notable_skills.length > 1 && (
                                                            <span className="inline-flex items-center rounded bg-slate-100 border border-slate-200 px-1 py-0.5 text-[10px] font-bold text-slate-700">
                                                                +{guard.notable_skills.length - 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200/60 shrink-0">
                                            {t.status_available || "ĐANG RẢNH"}
                                        </span>
                                    </div>
                                ))
                            )}

                            {availableGuardsList.length === 0 && !isLoadingStats && (
                                <div className="text-center py-6 text-xs text-slate-400">
                                    {t.no_available_guards || "Không có bảo vệ nào rảnh thời điểm hiện tại."}
                                </div>
                            )}
                        </div>

                        {/* Footer banner link for available guards */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsAvailableGuardsModalOpen(true)}
                                className="w-full py-2.5 px-4 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl text-center transition-colors cursor-pointer"
                            >
                                {(t.view_all_available_guards || "Xem tất cả {count} bảo vệ rảnh thời điểm hiện tại").replace("{count}", String(availableGuardsList.length))}
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Biểu đồ Hiệu suất Bảo vệ (Gọn gàng compact height) */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">
                                    {t.card_radar_title || "Biểu đồ Hiệu suất Bảo vệ"}
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                    {t.card_radar_subtitle || "RADAR HIỆU SUẤT"} ({getTimeFilterLabel(timeFilter).toUpperCase()})
                                </p>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
                                {getTimeFilterLabel(timeFilter)}
                            </span>
                        </div>

                        {/* Compact Radar Chart (h-48) */}
                        <div className="w-full h-48 flex items-center justify-center">
                            {isLoadingStats ? (
                                <div className="w-36 h-36 rounded-full border-4 border-slate-100 border-t-sky-400 animate-spin flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-b-indigo-400 animate-spin" />
                                </div>
                            ) : mounted ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="62%" data={performanceRadarData}>
                                        <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
                                        <PolarAngleAxis
                                            dataKey="subject"
                                            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                                        />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-slate-900/90 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-slate-700">
                                                            <p className="font-bold">{data.subject}</p>
                                                            <p className="text-[11px] text-slate-300 mt-0.5">
                                                                Số lượng: <span className="font-extrabold text-sky-400">{data.count}</span>
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Radar
                                            name="Hiệu suất"
                                            dataKey="score"
                                            stroke="#93c5fd"
                                            fill="#bfdbfe"
                                            fillOpacity={0.65}
                                            strokeWidth={1.5}
                                            isAnimationActive={true}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-xs text-slate-400 font-medium">
                                    {t.loading_chart || "Đang tải biểu đồ..."}
                                </div>
                            )}
                        </div>

                        {/* Metric Score Pills inside Compact Right Card */}
                        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 mt-1">
                            {isLoadingStats ? (
                                Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={idx} className="h-7 bg-slate-100 rounded-lg animate-pulse" />
                                ))
                            ) : (
                                performanceRadarData.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between px-2.5 py-1 rounded-lg border text-[11px] font-bold ${item.badgeBg}`}
                                    >
                                        <span className="truncate">{item.subject}</span>
                                        <span className="shrink-0 ml-1 font-extrabold">{item.count}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Popup for All Current & Upcoming Shifts */}
            {isCurrentUpcomingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {t.modal_current_upcoming_title || "Danh sách Ca trực Hiện tại & Sắp tới"}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {(t.modal_current_upcoming_total || "Tổng cộng {count} ca trực đang diễn ra & sắp tới").replace("{count}", String(currentUpcomingShiftsList.length))}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCurrentUpcomingModalOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Search Bar */}
                        <div className="p-4 border-b border-slate-100 bg-white">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder={t.search_placeholder_shift || "Tìm kiếm theo tên bảo vệ, vị trí, mã ID ca..."}
                                    value={currentUpcomingSearchKeyword}
                                    onChange={(e) => setCurrentUpcomingSearchKeyword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Modal Body - Scrollable List */}
                        <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[50vh]">
                            {filteredCurrentUpcomingShifts.map((shift, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-xl p-4 transition-all flex items-center justify-between ${shift.type === "ONGOING"
                                            ? "bg-emerald-50/80 border-l-4 border-emerald-600 border border-slate-200/60"
                                            : "bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center text-slate-600">
                                            {shift.avatar ? (
                                                <img
                                                    src={shift.avatar}
                                                    alt={shift.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.display = "none";
                                                        if ((e.target as HTMLElement).nextElementSibling) {
                                                            ((e.target as HTMLElement).nextElementSibling as HTMLElement).classList.remove("hidden");
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <User className={`w-5 h-5 text-slate-500 ${shift.avatar ? "hidden" : ""}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                                {shift.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                                                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{shift.location}</span>
                                                </span>
                                                {shift.phone && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                                                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                            <span>{shift.phone}</span>
                                                        </span>
                                                    </>
                                                )}
                                                <span className="text-slate-300">•</span>
                                                <span className="font-mono text-slate-400">{shift.id}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="flex items-center gap-1.5 justify-end text-xs shrink-0">
                                            {renderStatusIcon(shift.statusText, shift.timeText)}
                                            <span className={shift.type === "ONGOING" ? "text-emerald-700 font-extrabold" : "text-slate-600 font-semibold"}>
                                                {getTranslatedTimeText(shift.timeText)}
                                            </span>
                                        </span>
                                        <div className="flex items-center justify-end gap-1.5 flex-wrap mt-1">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusBadgeStyle(shift.statusText)}`}
                                            >
                                                {getTranslatedStatusText(shift.statusText)}
                                            </span>
                                            {(shift.isOvertime || (Number(shift.overtimeMinutes) > 0)) && (
                                                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-amber-300 bg-amber-100/90 text-amber-800">
                                                    {dict?.common?.overtime || "TĂNG CA"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredCurrentUpcomingShifts.length === 0 && (
                                <div className="text-center py-8 text-xs text-slate-400">
                                    {t.no_matching_results || "Không tìm thấy kết quả phù hợp."}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCurrentUpcomingModalOpen(false)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                {t.close_modal || "Đóng"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Popup for All Past Shifts */}
            {isPastShiftsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {t.modal_past_title_past || "Danh sách Các ca trực đã qua"}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {(t.modal_past_total || "Tổng cộng {count} ca trực đã hoàn tất").replace("{count}", String(pastShiftsList.length))}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPastShiftsModalOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Search Bar */}
                        <div className="p-4 border-b border-slate-100 bg-white">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder={t.search_placeholder_shift || "Tìm kiếm theo tên bảo vệ, vị trí, mã ID ca..."}
                                    value={modalSearchKeyword}
                                    onChange={(e) => setModalSearchKeyword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Modal Body - Scrollable List */}
                        <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[50vh]">
                            {filteredPastShifts.map((shift, idx) => (
                                <div
                                    key={idx}
                                    className="bg-slate-50/80 hover:bg-slate-100/90 rounded-xl p-3.5 border border-slate-100 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center text-slate-600">
                                            {shift.avatar ? (
                                                <img
                                                    src={shift.avatar}
                                                    alt={shift.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.display = "none";
                                                        if ((e.target as HTMLElement).nextElementSibling) {
                                                            ((e.target as HTMLElement).nextElementSibling as HTMLElement).classList.remove("hidden");
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <User className={`w-5 h-5 text-slate-500 ${shift.avatar ? "hidden" : ""}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                                {shift.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                                                <span>{shift.location}</span>
                                                {shift.contractName && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-slate-600 font-semibold">{shift.contractName}</span>
                                                    </>
                                                )}
                                                {shift.phone && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                                                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                            <span>{shift.phone}</span>
                                                        </span>
                                                    </>
                                                )}
                                                <span className="text-slate-300">•</span>
                                                <span className="font-mono text-slate-400">{shift.id}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="flex items-center gap-1 justify-end text-xs font-semibold text-slate-600 shrink-0">
                                            {renderStatusIcon(shift.status)}
                                            <span>{shift.time}</span>
                                        </span>
                                        <div className="flex items-center justify-end gap-1.5 flex-wrap mt-1">
                                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusBadgeStyle(shift.status)}`}>
                                                {getTranslatedStatusText(shift.status)}
                                            </span>
                                            {(shift.isOvertime || (Number(shift.overtimeMinutes) > 0)) && (
                                                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-amber-300 bg-amber-100/90 text-amber-800">
                                                    {dict?.common?.overtime || "TĂNG CA"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredPastShifts.length === 0 && (
                                <div className="text-center py-8 text-xs text-slate-400">
                                    {t.no_matching_results || "Không tìm thấy kết quả phù hợp."}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsPastShiftsModalOpen(false)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                {t.close_modal || "Đóng"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Popup for All Available Guards */}
            {isAvailableGuardsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {t.modal_available_title || "Danh sách Bảo vệ rảnh thời điểm hiện tại"}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {(t.modal_available_total || "Tổng cộng {count} nhân sự sẵn sàng điều phối").replace("{count}", String(availableGuardsList.length))}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAvailableGuardsModalOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Search Bar */}
                        <div className="p-4 border-b border-slate-100 bg-white">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder={t.search_placeholder_guard || "Tìm kiếm theo tên bảo vệ, chuyên môn, mã ID..."}
                                    value={guardSearchKeyword}
                                    onChange={(e) => setGuardSearchKeyword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Modal Body - Scrollable List */}
                        <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[50vh]">
                            {filteredAvailableGuards.map((guard, idx) => (
                                <div
                                    key={idx}
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setHoveredGuardInfo({ guard, x: rect.left, y: rect.top });
                                    }}
                                    onMouseLeave={() => setHoveredGuardInfo(null)}
                                    className="bg-slate-50/80 hover:bg-slate-100/90 rounded-xl p-3.5 border border-slate-100 transition-all flex items-center justify-between cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center text-slate-600">
                                            {guard.avatar ? (
                                                <img
                                                    src={guard.avatar}
                                                    alt={guard.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.display = "none";
                                                        if ((e.target as HTMLElement).nextElementSibling) {
                                                            ((e.target as HTMLElement).nextElementSibling as HTMLElement).classList.remove("hidden");
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <User className={`w-5 h-5 text-slate-500 ${guard.avatar ? "hidden" : ""}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                                                    {guard.name}
                                                </h4>
                                                <span className="text-[10px] font-mono text-slate-400">
                                                    {guard.id}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span>{guard.phone || (isEn ? "No phone" : "Chưa có SĐT")}</span>
                                            </p>
                                            {Array.isArray(guard.notable_skills) && guard.notable_skills.length > 0 && (
                                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                                    <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                                                        <Award size={11} className="text-blue-600 shrink-0" />
                                                        <span className="truncate max-w-[130px]">{guard.notable_skills[0]}</span>
                                                    </span>
                                                    {guard.notable_skills.length > 1 && (
                                                        <span className="inline-flex items-center rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[11px] font-bold text-slate-700">
                                                            +{guard.notable_skills.length - 1}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200/80 uppercase tracking-wide">
                                            {t.status_available || "ĐANG RẢNH"}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {filteredAvailableGuards.length === 0 && (
                                <div className="text-center py-8 text-xs text-slate-400">
                                    {t.no_matching_results || "Không tìm thấy kết quả phù hợp."}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsAvailableGuardsModalOpen(false)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                {t.close_modal || "Đóng"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Creating Shift */}
            <CreateShiftModal
                open={isCreateShiftOpen}
                onClose={() => setIsCreateShiftOpen(false)}
                onCreated={() => {
                    showToast(t.toast_create_shift_success || "Tạo ca trực mới thành công!");
                    setIsCreateShiftOpen(false);
                    handleRefresh();
                }}
            />

            {/* Floating Hover Details Popover Card for Available Guards */}
            {hoveredGuardInfo && (
                <div
                    className="fixed z-[99999] w-80 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 text-left"
                    style={{
                        top: `${Math.max(16, Math.min(typeof window !== "undefined" ? window.innerHeight - 380 : 500, hoveredGuardInfo.y - 15))}px`,
                        left: `${hoveredGuardInfo.x > 340 ? hoveredGuardInfo.x - 332 : hoveredGuardInfo.x + 360}px`,
                    }}
                >
                    {(() => {
                        const g = hoveredGuardInfo.guard;
                        const skills = Array.isArray(g.notable_skills) ? g.notable_skills : [];
                        const unupdatedText = isEn ? "Not updated" : "Chưa cập nhật";
                        return (
                            <div className="space-y-3">
                                {/* Header with Avatar & Name */}
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-blue-600 bg-slate-100 shadow-sm">
                                        {g.avatar ? (
                                            <img
                                                src={g.avatar}
                                                alt={g.name || "Guard"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="truncate font-bold text-sm text-slate-900">
                                            {g.name || unupdatedText}
                                        </h4>
                                        <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200/60">
                                            {isEn ? "Approved Guard" : "Bảo vệ đã duyệt"}
                                        </span>
                                    </div>
                                </div>

                                {/* Contact & CCCD Info */}
                                <div className="space-y-1.5 text-xs text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <IdCard size={14} className="text-blue-700 shrink-0" />
                                        <span className="text-slate-500 font-medium">
                                            {isEn ? "ID Card:" : "CCCD:"}
                                        </span>
                                        <span className="font-semibold text-slate-900">{g.cccd || unupdatedText}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-blue-700 shrink-0" />
                                        <span className="text-slate-500 font-medium">
                                            {isEn ? "Phone:" : "SĐT:"}
                                        </span>
                                        <span className="font-medium text-slate-900">{g.phone || unupdatedText}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-blue-700 shrink-0" />
                                        <span className="text-slate-500 font-medium">
                                            Email:
                                        </span>
                                        <span className="truncate font-medium text-slate-900">{g.email || unupdatedText}</span>
                                    </div>
                                    {(g.height_cm || g.weight_kg) && (
                                        <div className="flex items-center gap-2">
                                            <Activity size={14} className="text-blue-700 shrink-0" />
                                            <span className="text-slate-500 font-medium">
                                                {isEn ? "Physical:" : "Thể chất:"}
                                            </span>
                                            <span className="font-medium text-slate-900">
                                                {g.height_cm ? `${g.height_cm} cm` : "—"} · {g.weight_kg ? `${g.weight_kg} kg` : "—"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Notable Skills */}
                                <div className="border-t border-slate-100 pt-2.5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                                        <Award size={13} className="text-blue-700" />
                                        <span>
                                            {isEn ? `Notable Skills (${skills.length}):` : `Kỹ năng nổi bật (${skills.length}):`}
                                        </span>
                                    </div>
                                    {skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                            {skills.map((skill, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-900"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-slate-400 italic">
                                            {isEn ? "No notable skills updated." : "Chưa cập nhật kỹ năng."}
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
