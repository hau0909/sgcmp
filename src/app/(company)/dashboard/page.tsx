"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Users,
  ReceiptText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Search,
  Filter,
  UserCheck,
  AlertCircle,
  RefreshCw,
  DollarSign,
  X,
  ClockAlert,
  UserX,
  Clock3,
  UserRoundCog,
  FileWarning,
  LoaderCircle,
  CircleCheckBig,
  CircleX,
  FileCheck2,
  BadgeCheck,
  Inbox,
  CalendarClock,
  UserRoundCheck,
  UserPlus,
  CreditCard,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/components/providers/LanguageProvider";
import {
  requestGetActiveGuardsOnShift,
  requestGetActiveContracts,
  requestGetPendingReports,
  requestGetDashboardSubscription,
  requestGetActiveContractsTrend,
  requestGetRecentActivities,
  type MetricWithTrend,
  type DashboardSubscriptionResult,
  type ActiveContractTrendItem,
  type RecentActivityItem,
} from "@/features/dashboard/api/dashboard.api";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type EmployeeStatus =
  | "Hoàn thành"
  | "Đang trực"
  | "Vắng mặt"
  | "Đi trễ"
  | "Thay ca"
  | "Điểm danh trễ"
  | "Phân công"
type ChartView = "line" | "radar";

const getFormattedDate = (locale: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date().toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', options);
};



const getActivityConfig = (subType: string) => {
  switch (subType) {
    // Attendance
    case "attendance_on_time":
      return {
        icon: <UserCheck className="w-4 h-4" />,
        className: "bg-emerald-50 border-emerald-200 text-emerald-700",
      };
    case "attendance_late":
      return {
        icon: <ClockAlert className="w-4 h-4" />,
        className: "bg-orange-50 border-orange-200 text-orange-700",
      };
    case "attendance_absent":
      return {
        icon: <UserX className="w-4 h-4" />,
        className: "bg-red-50 border-red-200 text-red-700",
      };
    case "attendance_no_checkin":
      return {
        icon: <Clock3 className="w-4 h-4" />,
        className: "bg-amber-50 border-amber-200 text-amber-700",
      };
    case "attendance_checkout":
      return {
        icon: <UserCheck className="w-4 h-4" />,
        className: "bg-emerald-50 border-emerald-200 text-emerald-700",
      };
    case "attendance_completed":
      return {
        icon: <CircleCheckBig className="w-4 h-4" />,
        className: "bg-emerald-50 border-emerald-200 text-emerald-700",
      };

    // Replacement
    case "replacement_dispatched":
      return {
        icon: <UserRoundCog className="w-4 h-4" />,
        className: "bg-blue-50 border-blue-200 text-blue-700",
      };

    // Report
    case "report_pending":
      return {
        icon: <FileWarning className="w-4 h-4" />,
        className: "bg-red-50 border-red-200 text-red-700 animate-pulse",
      };
    case "report_in_progress":
      return {
        icon: <LoaderCircle className="w-4 h-4 animate-spin" />,
        className: "bg-blue-50 border-blue-200 text-blue-700",
      };
    case "report_resolved":
      return {
        icon: <CircleCheckBig className="w-4 h-4" />,
        className: "bg-emerald-50 border-emerald-200 text-emerald-700",
      };
    case "report_closed":
      return {
        icon: <CircleX className="w-4 h-4" />,
        className: "bg-surface-container-high border-outline-variant text-on-surface-variant/80",
      };

    // Contract
    case "contract_confirmed":
      return {
        icon: <FileCheck2 className="w-4 h-4" />,
        className: "bg-emerald-50 border-emerald-200 text-emerald-700",
      };
    case "contract_active":
      return {
        icon: <BadgeCheck className="w-4 h-4" />,
        className: "bg-blue-50 border-blue-200 text-blue-700",
      };
    case "contract_booking_pending":
      return {
        icon: <Inbox className="w-4 h-4" />,
        className: "bg-purple-50 border-purple-200 text-purple-700",
      };
    case "contract_expiry_warning":
      return {
        icon: <CalendarClock className="w-4 h-4" />,
        className: "bg-orange-50 border-orange-200 text-orange-700",
      };

    // System
    case "system_coordinator_active":
      return {
        icon: <UserRoundCheck className="w-4 h-4" />,
        className: "bg-emerald-50 border-emerald-200 text-emerald-700",
      };
    case "system_guard_added":
      return {
        icon: <UserPlus className="w-4 h-4" />,
        className: "bg-blue-50 border-blue-200 text-blue-700",
      };
    case "system_subscription_renewed":
      return {
        icon: <CreditCard className="w-4 h-4" />,
        className: "bg-purple-50 border-purple-200 text-purple-700",
      };

    default:
      return {
        icon: <Users className="w-4 h-4" />,
        className: "bg-surface-container-high border-outline-variant text-primary",
      };
  }
};

const getEmployeeStatusLabel = (status: string, dict: any) => {
  const statusKeyMap: Record<string, string> = {
    "Hoàn thành": dict?.company_dashboard?.employee_status?.completed || "Hoàn thành",
    "Đang trực": dict?.company_dashboard?.employee_status?.on_duty || "Đang trực",
    "On Duty": dict?.company_dashboard?.employee_status?.on_duty || "Đang trực",
    "Vắng mặt": dict?.company_dashboard?.employee_status?.absent || "Vắng mặt",
    "Absent": dict?.company_dashboard?.employee_status?.absent || "Vắng mặt",
    "Đi trễ": dict?.company_dashboard?.employee_status?.late || "Đi trễ",
    "Late": dict?.company_dashboard?.employee_status?.late || "Đi trễ",
    "Thay ca": dict?.company_dashboard?.employee_status?.shift_change || "Thay ca",
    "Shift Change": dict?.company_dashboard?.employee_status?.shift_change || "Thay ca",
    "Thay thế": dict?.company_dashboard?.employee_status?.shift_change || "Thay ca",
    "Replace": dict?.company_dashboard?.employee_status?.shift_change || "Thay ca",
    "Replacement": dict?.company_dashboard?.employee_status?.shift_change || "Replacement",
    "Điểm danh trễ": dict?.company_dashboard?.employee_status?.late_checkin || "Điểm danh trễ",
    "Late Check-in": dict?.company_dashboard?.employee_status?.late_checkin || "Điểm danh trễ",
    "Phân công": dict?.company_dashboard?.employee_status?.assigned || "Phân công",
    "Assigned": dict?.company_dashboard?.employee_status?.assigned || "Phân công",
    "Chưa điểm danh": dict?.company_dashboard?.employee_status?.not_checked_in || "Chưa điểm danh",
    "Not Checked-in": dict?.company_dashboard?.employee_status?.not_checked_in || "Chưa điểm danh",
  };
  return statusKeyMap[status] || status;
};

const formatActivity = (act: RecentActivityItem, locale: string) => {
  let boldText = act.boldText || "";
  let normalText = act.normalText || "";
  let timeLabel = act.timeLabel || "";
  let metaLabel = act.metaLabel || "";

  if (locale === "en") {
    // 1. boldText translations
    if (boldText === "Khách hàng") boldText = "Customer";
    else if (boldText === "Điều phối viên") boldText = "Coordinator";
    else if (boldText === "Công ty") boldText = "Company";
    else if (boldText === "Báo cáo sự cố") boldText = "Incident Report";
    else if (boldText === "Hợp đồng") boldText = "Contract";
    else if (boldText === "Hợp đồng mới") boldText = "New Contract";
    else if (boldText === "Bảo vệ mới") boldText = "New Guard";
    else if (boldText.startsWith("Báo cáo bảo vệ ")) {
      const rawType = boldText.replace("Báo cáo bảo vệ ", "").toLowerCase();
      let typeEn = rawType;
      if (rawType.includes("đi muộn") || rawType.includes("đi trễ")) typeEn = "late arrival";
      else if (rawType.includes("vắng mặt")) typeEn = "absence";
      else if (rawType.includes("thái độ")) typeEn = "poor attitude";
      else if (rawType.includes("ngủ gật")) typeEn = "sleeping on duty";
      else if (rawType.includes("khác")) typeEn = "other incident";
      boldText = `Incident report for guard (${typeEn})`;
    } else if (boldText.startsWith("Hợp đồng HD-")) {
      boldText = boldText.replace("Hợp đồng HD-", "Contract HD-");
    } else if (boldText.startsWith("Điều phối viên ")) {
      boldText = boldText.replace("Điều phối viên ", "Coordinator ");
    }

    // 2. normalText translations
    if (normalText.includes("đã điểm danh ca trực đúng giờ")) {
      normalText = " checked in on time for the shift.";
    } else if (normalText.includes("đã điểm danh trễ")) {
      const match = normalText.match(/\d+/);
      const mins = match ? match[0] : "";
      normalText = ` checked in late by ${mins} minutes.`;
    } else if (normalText.includes("chưa điểm danh và đã trễ ca trực")) {
      normalText = " has not checked in and is late for the shift.";
    } else if (normalText.includes("bị đánh dấu vắng mặt")) {
      normalText = " was marked absent.";
    } else if (normalText.includes("đã kết thúc ca")) {
      normalText = " ended the shift.";
    } else if (normalText.includes("đã điểm danh ca trực")) {
      normalText = " checked in for the shift.";
    } else if (normalText.includes("đã điều động")) {
      const match = normalText.match(/đã điều động (.+) thay cho (.+)\./);
      if (match) {
        normalText = ` dispatched ${match[1]} to replace ${match[2]}.`;
      } else {
        normalText = " dispatched a replacement guard.";
      }
    } else if (normalText.includes("đã gửi báo cáo bảo vệ")) {
      const match = normalText.match(/đã gửi báo cáo bảo vệ (.+)\./);
      const reportTypeStr = match ? match[1] : "";
      let translatedType = reportTypeStr;
      if (reportTypeStr.includes("đi muộn") || reportTypeStr.includes("đi trễ")) translatedType = "late arrival";
      else if (reportTypeStr.includes("vắng mặt")) translatedType = "absence";
      else if (reportTypeStr.includes("thái độ")) translatedType = "poor attitude";
      else if (reportTypeStr.includes("ngủ gật")) translatedType = "sleeping on duty";
      else translatedType = "incident";
      normalText = ` submitted an incident report regarding guard ${translatedType}.`;
    } else if (normalText.includes("đã được chuyển sang đang xử lý")) {
      normalText = " has been moved to in-progress.";
    } else if (normalText.includes("đã được giải quyết")) {
      normalText = " has been resolved.";
    } else if (normalText.includes("đã được đóng")) {
      normalText = " has been closed.";
    } else if (normalText.includes("đã chuyển sang hoạt động")) {
      normalText = " has been activated.";
    } else if (normalText.includes("đã chính thức có hiệu lực")) {
      normalText = " has officially taken effect.";
    } else if (normalText.includes("sẽ hết hạn sau") || normalText.includes("sẽ hết hạn trong")) {
      const match = normalText.match(/\d+/);
      const days = match ? match[0] : "";
      normalText = ` will expire in ${days} days.`;
    } else if (normalText.includes("nhận được một yêu cầu dịch vụ mới")) {
      normalText = " received a new service request.";
    } else if (normalText.includes("đã được kích hoạt tài khoản")) {
      normalText = " account has been activated.";
    } else if (normalText.includes("đang xử lý báo cáo sự cố")) {
      normalText = " is processing the incident report.";
    } else if (normalText.includes("đang chờ được duyệt")) {
      normalText = " is pending approval.";
    } else if (normalText.includes("vừa gia nhập hệ thống")) {
      const match = normalText.match(/(.+) vừa gia nhập hệ thống\./);
      const name = match ? match[1].trim() : "";
      normalText = ` ${name} joined the system.`;
    }

    // 3. timeLabel translations
    timeLabel = timeLabel
      .replace("Hôm nay", "Today")
      .replace("Hôm qua", "Yesterday");

    // 4. metaLabel translations
    metaLabel = metaLabel
      .replace(/^Hệ thống$/, "System")
      .replace(/^Cảnh báo$/, "Warning")
      .replace(/^Yêu cầu mới$/, "New Request")
      .replace(/Hợp đồng /g, "Contract ")
      .replace(/Ca sáng/g, "Morning Shift")
      .replace(/Ca chiều/g, "Afternoon Shift")
      .replace(/Ca đêm/g, "Night Shift");
  } else {
    // locale === "vi"
    if (boldText.startsWith("Contract HD-")) {
      boldText = boldText.replace("Contract HD-", "Hợp đồng HD-");
    } else if (boldText === "Customer") boldText = "Khách hàng";
    else if (boldText === "Coordinator") boldText = "Điều phối viên";
    else if (boldText === "Company") boldText = "Công ty";
    else if (boldText === "Incident Report") boldText = "Báo cáo sự cố";
    else if (boldText === "Contract") boldText = "Hợp đồng";
    else if (boldText === "New Contract") boldText = "Hợp đồng mới";
    else if (boldText === "New Guard") boldText = "Bảo vệ mới";

    if (normalText.includes("will expire in")) {
      const match = normalText.match(/\d+/);
      const days = match ? match[0] : "";
      normalText = ` sẽ hết hạn trong ${days} ngày.`;
    } else if (normalText.includes("was marked absent.")) {
      normalText = " đã bị đánh dấu vắng mặt.";
    } else if (normalText.includes("ended the shift.")) {
      normalText = " đã kết thúc ca làm.";
    } else if (normalText.includes("checked in on time")) {
      normalText = " đã điểm danh ca trực đúng giờ.";
    } else if (normalText.includes("checked in late by")) {
      const match = normalText.match(/\d+/);
      const mins = match ? match[0] : "";
      normalText = ` đã điểm danh trễ ${mins} phút.`;
    } else if (normalText.includes("has not checked in and is late")) {
      normalText = " chưa điểm danh và đã trễ ca trực.";
    } else if (normalText.includes("checked in for the shift.")) {
      normalText = " đã điểm danh ca trực.";
    } else if (normalText.includes("dispatched a replacement guard.")) {
      normalText = " đã điều động bảo vệ thay thế.";
    } else if (normalText.includes("has been activated.")) {
      normalText = " đã chuyển sang hoạt động.";
    } else if (normalText.includes("received a new service request.")) {
      normalText = " đã nhận một yêu cầu dịch vụ mới.";
    }

    timeLabel = timeLabel
      .replace("Today", "Hôm nay")
      .replace("Yesterday", "Hôm qua");

    metaLabel = metaLabel
      .replace(/^System$/, "Hệ thống")
      .replace(/^Warning$/, "Cảnh báo")
      .replace(/^New Request$/, "Yêu cầu mới")
      .replace(/Contract /g, "Hợp đồng ")
      .replace(/Morning Shift/g, "Ca sáng")
      .replace(/Afternoon Shift/g, "Ca chiều")
      .replace(/Night Shift/g, "Ca đêm");
  }

  return {
    ...act,
    boldText,
    normalText,
    timeLabel,
    metaLabel,
  };
};

export default function CompanyDashboardPage() {
  const { dict, locale } = useTranslation();

  const activeContractsChartConfig = {
    activeContracts: {
      label: dict.company_dashboard?.contracts_trend?.series_label || dict.company_dashboard?.active_contracts || "Hợp đồng đang hoạt động",
      color: "#3b82f6", // Blue
    },
  } satisfies ChartConfig;

  // Dữ liệu metric: bảo vệ đang trực
  const company_id = useAuthStore((s) => s.company_id);
  const [activeGuards, setActiveGuards] = useState<MetricWithTrend | null>(null);
  const [activeGuardsLoading, setActiveGuardsLoading] = useState(false);

  // Dữ liệu metric: hợp đồng hoạt động
  const [activeContracts, setActiveContracts] = useState<MetricWithTrend | null>(null);
  const [activeContractsLoading, setActiveContractsLoading] = useState(false);

  // Dữ liệu metric: báo cáo chờ xử lý
  const [pendingReports, setPendingReports] = useState<MetricWithTrend | null>(null);
  const [pendingReportsLoading, setPendingReportsLoading] = useState(false);

  // Fetch báo cáo sự cố chờ xử lý
  useEffect(() => {
    if (!company_id) return;
    setPendingReportsLoading(true);
    requestGetPendingReports(company_id)
      .then(setPendingReports)
      .catch((err) => console.error("[dashboard] pendingReports:", err))
      .finally(() => setPendingReportsLoading(false));
  }, [company_id]);

  // Dữ liệu xu hướng hợp đồng hoạt động (Theo tuần / Theo tháng)
  const [contractsTrendView, setContractsTrendView] = useState<"weekly" | "monthly">("weekly");
  const [contractsTrendData, setContractsTrendData] = useState<ActiveContractTrendItem[]>([]);
  const [contractsTrendLoading, setContractsTrendLoading] = useState(false);

  // Fetch dữ liệu xu hướng hợp đồng
  useEffect(() => {
    if (!company_id) return;
    setContractsTrendLoading(true);
    requestGetActiveContractsTrend(company_id, contractsTrendView)
      .then(setContractsTrendData)
      .catch((err) => console.error("[dashboard] contractsTrendData:", err))
      .finally(() => setContractsTrendLoading(false));
  }, [company_id, contractsTrendView]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!company_id) return;
    setIsRefreshing(true);
    try {
      setActiveGuardsLoading(true);
      setActiveContractsLoading(true);
      setPendingReportsLoading(true);
      setSubInfoLoading(true);
      setContractsTrendLoading(true);

      await Promise.all([
        requestGetActiveGuardsOnShift(company_id).then(setActiveGuards).catch((err) => console.error(err)),
        requestGetActiveContracts(company_id).then(setActiveContracts).catch((err) => console.error(err)),
        requestGetPendingReports(company_id).then(setPendingReports).catch((err) => console.error(err)),
        requestGetDashboardSubscription(company_id).then(setSubInfo).catch((err) => console.error(err)),
        requestGetActiveContractsTrend(company_id, contractsTrendView).then(setContractsTrendData).catch((err) => console.error(err)),
      ]);
    } finally {
      setActiveGuardsLoading(false);
      setActiveContractsLoading(false);
      setPendingReportsLoading(false);
      setSubInfoLoading(false);
      setContractsTrendLoading(false);
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  // Fetch số bảo vệ đang trực
  useEffect(() => {
    if (!company_id) return;
    setActiveGuardsLoading(true);
    requestGetActiveGuardsOnShift(company_id)
      .then(setActiveGuards)
      .catch((err) => console.error("[dashboard] activeGuards:", err))
      .finally(() => setActiveGuardsLoading(false));
  }, [company_id]);

  // Fetch hợp đồng hoạt động
  useEffect(() => {
    if (!company_id) return;
    setActiveContractsLoading(true);
    requestGetActiveContracts(company_id)
      .then(setActiveContracts)
      .catch((err) => console.error("[dashboard] activeContracts:", err))
      .finally(() => setActiveContractsLoading(false));
  }, [company_id]);

  // Dữ liệu gói dịch vụ hiện tại
  const [subInfo, setSubInfo] = useState<DashboardSubscriptionResult | null>(null);
  const [subInfoLoading, setSubInfoLoading] = useState(false);

  // Fetch gói dịch vụ hiện tại và tài nguyên sử dụng
  useEffect(() => {
    if (!company_id) return;
    setSubInfoLoading(true);
    requestGetDashboardSubscription(company_id)
      .then(setSubInfo)
      .catch((err) => console.error("[dashboard] subInfo:", err))
      .finally(() => setSubInfoLoading(false));
  }, [company_id]);

  const employeeStatusConfig: Record<
    string,
    {
      badgeClass: string;
      dotClass: string;
      animate?: boolean;
    }
  > = {
    "Hoàn thành": {
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      dotClass: "bg-slate-400",
    },

    "Đang trực": {
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-600",
      animate: true,
    },

    "On Duty": {
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-600",
      animate: true,
    },

    "Vắng mặt": {
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      dotClass: "bg-red-600",
    },

    "Absent": {
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      dotClass: "bg-red-600",
    },

    "Đi trễ": {
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
      dotClass: "bg-orange-600",
    },

    "Late": {
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
      dotClass: "bg-orange-600",
    },

    "Thay ca": {
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      dotClass: "bg-purple-600",
    },

    "Shift Change": {
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      dotClass: "bg-purple-600",
    },

    "Thay thế": {
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      dotClass: "bg-purple-600",
    },

    "Replace": {
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      dotClass: "bg-purple-600",
    },

    "Replacement": {
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      dotClass: "bg-purple-600",
    },

    "Điểm danh trễ": {
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-600",
    },

    "Late Check-in": {
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-600",
    },

    "Phân công": {
      badgeClass: "bg-surface-container text-on-surface-variant border-outline-variant",
      dotClass: "bg-outline",
    },

    "Assigned": {
      badgeClass: "bg-surface-container text-on-surface-variant border-outline-variant",
      dotClass: "bg-outline",
    },

    "Chưa điểm danh": {
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      dotClass: "bg-red-500",
    },

    "Not Checked-in": {
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      dotClass: "bg-red-500",
    },
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">
            {dict.company_dashboard.overview}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{getFormattedDate(locale)}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 text-xs font-semibold rounded-xl border-outline-variant hover:border-primary/50 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{dict.coor_dashboard?.refresh || (locale === "en" ? "Refresh" : "Làm mới")}</span>
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 – Bảo vệ đang trực */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              {dict.company_dashboard.active_guards}
            </span>
            <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl leading-tight font-bold text-on-surface mb-1">
              {activeGuardsLoading ? (
                <span className="inline-block w-12 h-8 bg-surface-container rounded animate-pulse" />
              ) : (
                (activeGuards?.count ?? 0)
              )}
            </div>
          </div>
        </div>

        {/* Card 2 – Hợp đồng hoạt động */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              {dict.company_dashboard.active_contracts}
            </span>
            <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-primary">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl leading-tight font-bold text-on-surface mb-1">
              {activeContractsLoading ? (
                <span className="inline-block w-12 h-8 bg-surface-container rounded animate-pulse" />
              ) : (
                activeContracts?.count ?? 0
              )}
            </div>
            {activeContractsLoading ? (
              <span className="inline-block w-32 h-4 bg-surface-container rounded animate-pulse" />
            ) : activeContracts?.percentChange !== null && activeContracts?.percentChange !== undefined ? (
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${activeContracts.trend === "up"
                  ? "text-emerald-700"
                  : activeContracts.trend === "down"
                    ? "text-red-600"
                    : "text-on-surface-variant"
                  }`}
              >
                {activeContracts.trend === "up" && <TrendingUp className="w-4 h-4" />}
                {activeContracts.trend === "down" && <TrendingDown className="w-4 h-4" />}
                {activeContracts.trend === "neutral" && <Minus className="w-4 h-4" />}
                <span>
                  {activeContracts.trend === "up" ? "+" : ""}
                  {activeContracts.percentChange}% {dict.company_dashboard.compared_last_month}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-on-surface-variant font-medium">
                <Minus className="w-4 h-4" />
                <span>{dict.company_dashboard.no_data_last_month}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3 – Báo cáo sự cố chờ xử lý */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              {dict.company_dashboard.pending_reports}
            </span>
            <div className="w-8 h-8 rounded bg-error-container flex items-center justify-center text-error">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl leading-tight font-bold text-error mb-1">
              {pendingReportsLoading ? (
                <span className="inline-block w-12 h-8 bg-error-container/30 rounded animate-pulse" />
              ) : (
                pendingReports?.count ?? 0
              )}
            </div>
            {pendingReportsLoading ? (
              <span className="inline-block w-32 h-4 bg-error-container/30 rounded animate-pulse" />
            ) : (pendingReports?.count ?? 0) > 0 ? (
              <div className="flex items-center gap-1 text-sm text-error font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>{dict.company_dashboard.need_attention}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-on-surface-variant font-medium">
                <Minus className="w-4 h-4" />
                <span>{dict.company_dashboard.no_pending_reports}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Subscription Widget */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Operational Overview Charts: Active Contracts Trend */}
        <Card className="xl:col-span-8 border-outline-variant bg-surface-container-lowest shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-outline-variant/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base text-on-surface">
                {dict.company_dashboard?.contracts_trend?.title || "Thống kê Hợp đồng Hoạt động"}
              </CardTitle>
              <CardDescription className="text-xs text-on-surface-variant">
                {contractsTrendView === "weekly"
                  ? (dict.company_dashboard?.contracts_trend?.desc_weekly || "Số lượng hợp đồng đang hoạt động trong 7 ngày gần nhất")
                  : (dict.company_dashboard?.contracts_trend?.desc_monthly || "Số lượng hợp đồng đang hoạt động trong 30 ngày gần nhất")}
              </CardDescription>
            </div>

            <div className="flex w-full items-center rounded-lg border border-sky-200 bg-sky-50 p-1 sm:w-auto">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={contractsTrendView === "weekly"}
                onClick={() => setContractsTrendView("weekly")}
                className={`h-8 flex-1 px-3 text-xs font-semibold transition-all sm:flex-none ${contractsTrendView === "weekly"
                  ? "bg-sky-600 text-white shadow-sm hover:bg-sky-700 hover:text-white"
                  : "text-sky-700 hover:bg-sky-100 hover:text-sky-900"
                  }`}
              >
                {dict.company_dashboard?.contracts_trend?.btn_weekly || "Theo tuần (7 ngày)"}
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={contractsTrendView === "monthly"}
                onClick={() => setContractsTrendView("monthly")}
                className={`h-8 flex-1 px-3 text-xs font-semibold transition-all sm:flex-none ${contractsTrendView === "monthly"
                  ? "bg-sky-600 text-white shadow-sm hover:bg-sky-700 hover:text-white"
                  : "text-sky-700 hover:bg-sky-100 hover:text-sky-900"
                  }`}
              >
                {dict.company_dashboard?.contracts_trend?.btn_monthly || "Theo tháng (30 ngày)"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {contractsTrendLoading ? (
              <div className="h-[300px] min-h-[300px] w-full flex items-center justify-center bg-surface-container-low/20 rounded-lg animate-pulse border border-outline-variant/30">
                <span className="text-sm font-medium text-on-surface-variant">
                  {dict.company_dashboard?.contracts_trend?.loading || "Đang tải dữ liệu hợp đồng..."}
                </span>
              </div>
            ) : (
              <ChartContainer
                config={activeContractsChartConfig}
                className="h-[300px] min-h-[300px] w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={contractsTrendData}
                  margin={{ top: 8, right: 40, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    interval={contractsTrendView === "monthly" ? 4 : 0}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="activeContracts"
                    stroke="var(--color-activeContracts)"
                    strokeWidth={2.5}
                    dot={{ fill: "var(--color-activeContracts)", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Subscription Quick-View */}
        <div className="xl:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between shadow-sm">
          {subInfoLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="h-5 w-32 bg-surface-container rounded" />
                <div className="h-5 w-20 bg-surface-container rounded" />
              </div>
              <div className="h-20 bg-surface-container rounded-lg" />
              <div className="space-y-3">
                <div className="h-4 bg-surface-container rounded w-3/4" />
                <div className="h-2 bg-surface-container rounded" />
                <div className="h-4 bg-surface-container rounded w-1/4 align-right ml-auto" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-surface-container rounded w-3/4" />
                <div className="h-2 bg-surface-container rounded" />
                <div className="h-4 bg-surface-container rounded w-1/4 align-right ml-auto" />
              </div>
            </div>
          ) : !subInfo || !subInfo.plan ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-bold text-on-surface">
                  {dict.company_dashboard.subscription.title}
                </h3>
                <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                  {dict.company_dashboard.subscription.unregistered}
                </span>
              </div>
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm font-semibold text-on-surface-variant">
                  {dict.company_dashboard.subscription.no_plan}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-bold text-on-surface">
                  {dict.company_dashboard.subscription.title}
                </h3>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase text-center ${subInfo.subscription?.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                    {subInfo.subscription?.status === "active" ? dict.company_dashboard.subscription.active : dict.company_dashboard.subscription.expired}
                  </span>
                </div>
              </div>
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface leading-tight">
                      {subInfo.plan.plan_name}
                    </h4>
                    {subInfo.subscription && (
                      <p className="text-xs text-on-surface-variant mt-1">
                        {dict.company_dashboard.subscription.valid_until} {new Date(subInfo.subscription.end_date).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Guard Resource */}
              <div className="mb-2 flex justify-between text-xs text-on-surface-variant font-semibold">
                <span>{dict.company_dashboard.subscription.resource_guards}</span>
                <span className="font-mono">
                  {subInfo.usage.guards}/{subInfo.plan.max_guards ?? "∞"}
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2.5 mb-1 overflow-hidden border border-outline-variant/20">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: subInfo.plan.max_guards
                      ? `${Math.min(100, (subInfo.usage.guards / subInfo.plan.max_guards) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant/80 text-right mb-6">
                {subInfo.plan.max_guards
                  ? dict.company_dashboard.subscription.remaining_guards.replace("{0}", Math.max(0, subInfo.plan.max_guards - subInfo.usage.guards).toString())
                  : dict.company_dashboard.subscription.unlimited}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
