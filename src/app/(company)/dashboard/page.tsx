"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Users,
  ReceiptText,
  AlertTriangle,
  Star,
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
import {
  requestGetActiveGuardsOnShift,
  requestGetActiveContracts,
  requestGetPendingReports,
  requestGetRating,
  requestGetDashboardSubscription,
  requestGetWeeklyShifts,
  requestGetShiftStatusToday,
  requestGetTodayGuards,
  requestGetRecentActivities,
  type MetricWithTrend,
  type RatingWithTrend,
  type DashboardSubscriptionResult,
  type WeeklyShiftsResultItem,
  type ShiftStatusResultItem,
  type TodayGuardListItem,
  type RecentActivityItem,
} from "@/features/dashboard/api/dashboard.api";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
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
  | "Đang trực"
  | "Vắng mặt"
  | "Đi trễ"
  | "Thay ca"
  | "Điểm danh trễ"
  | "Phân công"
  | "Chưa điểm danh";
interface Employee {
  id: string;
  name: string;
  avatar: string | null;
  branch: string;
  contractCode?: string;
  contractName?: string;
  status: EmployeeStatus;
}

type ChartView = "line" | "radar";

const getFormattedDate = () => {
  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const today = new Date();
  const dayName = days[today.getDay()];
  const date = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return `${dayName}, ${date} tháng ${month}, ${year}`;
};

const weeklyShiftChartConfig = {
  totalAssignments: {
    label: "Tổng lượt phân công",
    color: "#3b82f6", // Blue
  },
  onTimeCheckins: {
    label: "Điểm danh đúng giờ",
    color: "#10b981", // Green
  },
  lateCheckins: {
    label: "Điểm danh trễ",
    color: "#f59e0b", // Yellow/Orange
  },
  absentGuards: {
    label: "Vắng mặt",
    color: "#ef4444", // Red
  },
} satisfies ChartConfig;

const shiftStatusChartConfig = {
  count: {
    label: "Số bảo vệ",
    color: "#6495ED", // Xanh nước biển
  },
} satisfies ChartConfig;



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

export default function CompanyDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chartView, setChartView] = useState<ChartView>("line");
  const [animateChart, setAnimateChart] = useState(false);

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

  // Dữ liệu biểu đồ ca trực 7 ngày
  const [weeklyShiftData, setWeeklyShiftData] = useState<WeeklyShiftsResultItem[]>([]);
  const [weeklyShiftDataLoading, setWeeklyShiftDataLoading] = useState(false);

  // Dữ liệu biểu đồ radar trạng thái ca trực hôm nay
  const [shiftStatusData, setShiftStatusData] = useState<ShiftStatusResultItem[]>([]);
  const [shiftStatusDataLoading, setShiftStatusDataLoading] = useState(false);

  // Dữ liệu bảng trạng thái bảo vệ hôm nay
  const [todayGuards, setTodayGuards] = useState<TodayGuardListItem[]>([]);
  const [todayGuardsLoading, setTodayGuardsLoading] = useState(false);

  // Dữ liệu hoạt động gần đây
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [recentActivitiesLoading, setRecentActivitiesLoading] = useState(false);

  // Trạng thái mở modal xem toàn bộ bảo vệ
  const [isGuardsModalOpen, setIsGuardsModalOpen] = useState(false);

  // Trạng thái mở modal xem toàn bộ hoạt động gần đây
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);

  // Bộ lọc loại hoạt động trong modal
  const [activityFilter, setActivityFilter] = useState<string>("all");

  // Trigger animation for the bars on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimateChart(true), 100);
    return () => clearTimeout(timer);
  }, []);

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

  // Dữ liệu metric: điểm đánh giá
  const [rating, setRating] = useState<RatingWithTrend | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Fetch báo cáo sự cố chờ xử lý
  useEffect(() => {
    if (!company_id) return;
    setPendingReportsLoading(true);
    requestGetPendingReports(company_id)
      .then(setPendingReports)
      .catch((err) => console.error("[dashboard] pendingReports:", err))
      .finally(() => setPendingReportsLoading(false));
  }, [company_id]);

  // Fetch điểm đánh giá trung bình
  useEffect(() => {
    if (!company_id) return;
    setRatingLoading(true);
    requestGetRating(company_id)
      .then(setRating)
      .catch((err) => console.error("[dashboard] rating:", err))
      .finally(() => setRatingLoading(false));
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

  // Fetch dữ liệu ca trực của bảo vệ trong 7 ngày
  useEffect(() => {
    if (!company_id) return;
    setWeeklyShiftDataLoading(true);
    requestGetWeeklyShifts(company_id)
      .then(setWeeklyShiftData)
      .catch((err) => console.error("[dashboard] weeklyShiftData:", err))
      .finally(() => setWeeklyShiftDataLoading(false));
  }, [company_id]);

  // Fetch dữ liệu biểu đồ radar trạng thái ca trực hôm nay
  useEffect(() => {
    if (!company_id) return;
    setShiftStatusDataLoading(true);
    requestGetShiftStatusToday(company_id)
      .then(setShiftStatusData)
      .catch((err) => console.error("[dashboard] shiftStatusData:", err))
      .finally(() => setShiftStatusDataLoading(false));
  }, [company_id]);

  // Fetch dữ liệu danh sách bảo vệ hôm nay
  useEffect(() => {
    if (!company_id) return;
    setTodayGuardsLoading(true);
    requestGetTodayGuards(company_id)
      .then(setTodayGuards)
      .catch((err) => console.error("[dashboard] todayGuards:", err))
      .finally(() => setTodayGuardsLoading(false));
  }, [company_id]);

  // Fetch dữ liệu hoạt động gần đây
  useEffect(() => {
    if (!company_id) return;
    setRecentActivitiesLoading(true);
    requestGetRecentActivities(company_id)
      .then(setRecentActivities)
      .catch((err) => console.error("[dashboard] recentActivities:", err))
      .finally(() => setRecentActivitiesLoading(false));
  }, [company_id]);

  const employeeStatusConfig: Record<
    EmployeeStatus,
    {
      badgeClass: string;
      dotClass: string;
      animate?: boolean;
    }
  > = {
    "Đang trực": {
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-600",
      animate: true,
    },

    "Vắng mặt": {
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      dotClass: "bg-red-600",
    },

    "Đi trễ": {
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
      dotClass: "bg-orange-600",
    },

    "Thay ca": {
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      dotClass: "bg-blue-600",
    },

    "Điểm danh trễ": {
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-600",
    },

    "Phân công": {
      badgeClass: "bg-surface-container text-on-surface-variant border-outline-variant",
      dotClass: "bg-outline",
    },

    "Chưa điểm danh": {
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      dotClass: "bg-red-500",
    },
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredEmployees = todayGuards.filter((emp) => {
    if (!normalizedSearchQuery) return true;

    return [
      emp.id,
      emp.name,
      emp.branch,
      emp.contractCode ?? "",
      emp.contractName ?? "",
      emp.status,
    ].some((value) => value.toLowerCase().includes(normalizedSearchQuery));
  });

  const displayedEmployees = filteredEmployees.slice(0, 5);

  const displayedActivities = displayedEmployees.length >= 0 ? recentActivities.slice(0, 5) : [];

  const filteredActivities = recentActivities.filter((act) => {
    if (activityFilter === "all") return true;
    return act.type === activityFilter;
  });

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">
            Tổng quan hệ thống
          </h2>
          <p className="text-sm text-slate-500 mt-1">{getFormattedDate()}</p>
        </div>
        <button className="bg-surface-container-lowest border border-outline-variant text-primary font-medium px-4 py-2 rounded flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm active:scale-95 duration-100">
          <Download className="w-5 h-5" />
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1 – Bảo vệ đang trực */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Số lượng Bảo vệ đang trực
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
            {activeGuardsLoading ? (
              <div className="flex items-center gap-1">
                <span className="inline-block w-32 h-4 bg-surface-container rounded animate-pulse" />
              </div>
            ) : activeGuards?.percentChange !== null && activeGuards?.percentChange !== undefined ? (
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${activeGuards.trend === "up"
                  ? "text-emerald-700"
                  : activeGuards.trend === "down"
                    ? "text-red-600"
                    : "text-on-surface-variant"
                  }`}
              >
                {activeGuards.trend === "up" && <TrendingUp className="w-4 h-4" />}
                {activeGuards.trend === "down" && <TrendingDown className="w-4 h-4" />}
                {activeGuards.trend === "neutral" && <Minus className="w-4 h-4" />}
                <span>
                  {activeGuards.trend === "up" ? "+" : ""}
                  {activeGuards.percentChange}% so với cùng giờ hôm qua
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-on-surface-variant font-medium">
                <Minus className="w-4 h-4" />
                <span>Không có dữ liệu hôm qua</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2 – Hợp đồng hoạt động */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Hợp đồng hoạt động
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
                  {activeContracts.percentChange}% so với tháng trước
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-on-surface-variant font-medium">
                <Minus className="w-4 h-4" />
                <span>Không có dữ liệu tháng trước</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3 – Báo cáo sự cố chờ xử lý */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Báo cáo sự cố chờ xử lý
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
                <span>Cần xử lý ngay</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-on-surface-variant font-medium">
                <Minus className="w-4 h-4" />
                <span>Không có sự cố chờ xử lý</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 4 – Điểm đánh giá */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Điểm đánh giá
            </span>
            <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-primary">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl leading-tight font-bold text-on-surface mb-1">
              {ratingLoading ? (
                <span className="inline-block w-20 h-8 bg-surface-container rounded animate-pulse" />
              ) : rating?.averageRating != null ? (
                `${rating.averageRating.toFixed(1)}/5`
              ) : (
                "--/5"
              )}
            </div>
            {ratingLoading ? (
              <span className="inline-block w-32 h-4 bg-surface-container rounded animate-pulse" />
            ) : rating?.percentChange !== null && rating?.percentChange !== undefined ? (
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${rating.trend === "up"
                  ? "text-emerald-700"
                  : rating.trend === "down"
                    ? "text-red-600"
                    : "text-on-surface-variant"
                  }`}
              >
                {rating.trend === "up" && <TrendingUp className="w-4 h-4" />}
                {rating.trend === "down" && <TrendingDown className="w-4 h-4" />}
                {rating.trend === "neutral" && <Minus className="w-4 h-4" />}
                <span>
                  {rating.trend === "up" ? "+" : ""}
                  {rating.percentChange}% so với tháng trước
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-on-surface-variant font-medium">
                <Minus className="w-4 h-4" />
                <span>Không có dữ liệu tháng trước</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Subscription Widget */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Operational Overview Charts */}
        <Card className="xl:col-span-8 border-outline-variant bg-surface-container-lowest shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-outline-variant/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base text-on-surface">
                {chartView === "line"
                  ? "Ca trực của bảo vệ trong 7 ngày"
                  : "Trạng thái ca trực của bảo vệ"}
              </CardTitle>
              <CardDescription className="text-xs text-on-surface-variant">
                {chartView === "line"
                  ? "Theo dõi tổng ca, ca đủ bảo vệ và ca còn thiếu bảo vệ theo từng ngày."
                  : "Phân bổ số lượng bảo vệ theo trạng thái ca trực hiện tại."}
              </CardDescription>
            </div>

            <div className="flex w-full items-center rounded-lg border border-sky-200 bg-sky-50 p-1 sm:w-auto">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={chartView === "line"}
                onClick={() => setChartView("line")}
                className={`h-8 flex-1 px-3 text-xs font-semibold transition-all sm:flex-none ${chartView === "line"
                  ? "bg-sky-600 text-white shadow-sm hover:bg-sky-700 hover:text-white"
                  : "text-sky-700 hover:bg-sky-100 hover:text-sky-900"
                  }`}
              >
                Ca trực 7 ngày
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={chartView === "radar"}
                onClick={() => setChartView("radar")}
                className={`h-8 flex-1 px-3 text-xs font-semibold transition-all sm:flex-none ${chartView === "radar"
                  ? "bg-sky-600 text-white shadow-sm hover:bg-sky-700 hover:text-white"
                  : "text-sky-700 hover:bg-sky-100 hover:text-sky-900"
                  }`}
              >
                Trạng thái ca
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {chartView === "line" ? (
              weeklyShiftDataLoading ? (
                <div className="h-[300px] min-h-[300px] w-full flex items-center justify-center bg-surface-container-low/20 rounded-lg animate-pulse border border-outline-variant/30">
                  <span className="text-sm font-medium text-on-surface-variant">Đang tải dữ liệu biểu đồ...</span>
                </div>
              ) : (
                <ChartContainer
                  config={weeklyShiftChartConfig}
                  className="h-[300px] min-h-[300px] w-full"
                >
                  <LineChart
                    accessibilityLayer
                    data={weeklyShiftData}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
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
                      dataKey="totalAssignments"
                      stroke="var(--color-totalAssignments)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--color-totalAssignments)", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="onTimeCheckins"
                      stroke="var(--color-onTimeCheckins)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--color-onTimeCheckins)", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="lateCheckins"
                      stroke="var(--color-lateCheckins)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--color-lateCheckins)", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="absentGuards"
                      stroke="var(--color-absentGuards)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--color-absentGuards)", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>
              )
            ) : (
              shiftStatusDataLoading ? (
                <div className="h-[300px] min-h-[300px] w-full flex items-center justify-center bg-surface-container-low/20 rounded-lg animate-pulse border border-outline-variant/30">
                  <span className="text-sm font-medium text-on-surface-variant">Đang tải trạng thái ca trực...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                  {/* Radar chart bên trái */}
                  <div className="lg:col-span-3">
                    <ChartContainer
                      config={shiftStatusChartConfig}
                      className="h-[300px] min-h-[300px] w-full"
                    >
                      <RadarChart
                        accessibilityLayer
                        data={shiftStatusData}
                        outerRadius="68%"
                      >
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />

                        <PolarGrid />

                        <PolarAngleAxis
                          dataKey="status"
                          tickLine={false}
                          tick={{ fontSize: 11 }}
                        />

                        <PolarRadiusAxis tick={false} axisLine={false} />

                        <Radar
                          dataKey="count"
                          fill="var(--color-count)"
                          fillOpacity={0.3}
                          stroke="var(--color-count)"
                          strokeWidth={2}
                          dot={{
                            r: 3,
                            fill: "var(--color-count)",
                          }}
                        />
                      </RadarChart>
                    </ChartContainer>
                  </div>

                  {/* Thông tin trạng thái bên phải */}
                  <div className="flex flex-col justify-center gap-4 lg:col-span-2">
                    <div className="mb-1">
                      <h4 className="text-sm font-bold text-on-surface">
                        Chi tiết trạng thái
                      </h4>

                      <p className="mt-1 text-xs text-on-surface-variant">
                        Số lượng bảo vệ theo trạng thái ca trực
                      </p>
                    </div>

                    <div className="space-y-3">
                      {shiftStatusData.map((item) => {
                        const status = item.status as EmployeeStatus;
                        const config = employeeStatusConfig[status] || { dotClass: "bg-surface-container", animate: false };

                        return (
                          <div
                            key={item.status}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${config.dotClass
                                  } ${config.animate ? "animate-pulse" : ""}`}
                              />

                              <span className="text-sm font-medium text-on-surface-variant">
                                {item.status}
                              </span>
                            </div>

                            <span className="text-base font-bold text-on-surface">
                              {item.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
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
                  Gói dịch vụ hiện tại
                </h3>
                <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                  CHƯA ĐĂNG KÝ
                </span>
              </div>
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm font-semibold text-on-surface-variant">
                  Bạn đang sử dụng gói mặc định hoặc chưa đăng ký dịch vụ.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-bold text-on-surface">
                  Gói dịch vụ hiện tại
                </h3>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase text-center ${subInfo.subscription?.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                    {subInfo.subscription?.status === "active" ? "HOẠT ĐỘNG" : "HẾT HẠN"}
                  </span>
                  {subInfo.subscription && (
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                      {subInfo.subscription.auto_renew ? "Tự động gia hạn" : "Gia hạn thủ công"}
                    </span>
                  )}
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
                        Hạn dùng: {new Date(subInfo.subscription.end_date).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Coordinator Resource */}
              <div className="mb-2 flex justify-between text-xs text-on-surface-variant font-semibold">
                <span>Sử dụng tài nguyên: Nhân viên điều phối</span>
                <span className="font-mono">
                  {subInfo.usage.coordinators}/{subInfo.plan.max_coordinators ?? "∞"}
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2.5 mb-1 overflow-hidden border border-outline-variant/20">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: subInfo.plan.max_coordinators
                      ? `${Math.min(100, (subInfo.usage.coordinators / subInfo.plan.max_coordinators) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant/80 text-right mb-6">
                {subInfo.plan.max_coordinators
                  ? `Còn ${Math.max(0, subInfo.plan.max_coordinators - subInfo.usage.coordinators)} nhân viên điều phối`
                  : "Không giới hạn số lượng"}
              </p>

              {/* Guard Resource */}
              <div className="mb-2 flex justify-between text-xs text-on-surface-variant font-semibold">
                <span>Sử dụng tài nguyên: Nhân viên bảo vệ</span>
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
                  ? `Còn ${Math.max(0, subInfo.plan.max_guards - subInfo.usage.guards)} nhân viên bảo vệ`
                  : "Không giới hạn số lượng"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Guard Status Table & Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Guard Availability/Status Table */}
        <div className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest">
            <h3 className="text-base font-bold text-on-surface">
              Trạng thái bảo vệ hôm nay
            </h3>
            <div className="flex items-center gap-2 border border-outline-variant rounded px-3 py-1.5 bg-surface-container-lowest w-full sm:w-64 focus-within:border-secondary transition-all">
              <Search className="w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Tìm ID, tên hoặc dịch vụ..."
                className="bg-transparent border-none p-0 text-xs focus:ring-0 outline-none w-full placeholder-on-surface-variant"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                  <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                    STT
                  </th>

                  <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                    Họ & Tên
                  </th>

                  <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                    Vị trí
                  </th>

                  <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                    Thời gian
                  </th>

                  <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                    Dịch vụ
                  </th>

                  <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {todayGuardsLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-outline-variant/30 animate-pulse"
                    >
                      <td className="px-6 py-4">
                        <div className="h-4 w-6 bg-surface-container rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-surface-container" />
                          <div className="h-4 w-28 bg-surface-container rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-32 bg-surface-container rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-surface-container rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 w-20 bg-surface-container rounded" />
                          <div className="h-3 w-36 bg-surface-container rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-surface-container rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : displayedEmployees.length > 0 ? (
                  displayedEmployees.map((emp, idx) => {
                    const statusConfig = employeeStatusConfig[emp.status as EmployeeStatus] || { badgeClass: "bg-surface-container text-on-surface-variant border-outline-variant", dotClass: "bg-outline", animate: false };

                    return (
                      <tr
                        key={`${emp.id}-${idx}`}
                        className="border-b border-outline-variant/30 hover:bg-surface-container-low/40 transition-colors group"
                      >
                        <td className="px-6 py-4 font-mono text-primary font-semibold text-xs">
                          {idx + 1}
                        </td>

                        <td className="px-6 py-4 text-on-surface font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-surface-container overflow-hidden shrink-0 border border-outline-variant/30">
                              {emp.avatar ? (
                                <img
                                  src={emp.avatar}
                                  alt={`Ảnh đại diện của ${emp.name}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-primary-container text-primary flex items-center justify-center text-xs font-bold uppercase">
                                  {emp.name.split(" ").pop()?.substring(0, 2)}
                                </div>
                              )}
                            </div>

                            <span>{emp.name}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-on-surface-variant text-xs font-medium">
                          {emp.branch}
                        </td>

                        <td className="px-6 py-4 text-on-surface-variant text-xs font-semibold whitespace-nowrap">
                          {emp.timeRange || "Chưa rõ"}
                        </td>

                        <td className="px-6 py-4">
                          {emp.contractCode ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-on-surface">
                                {emp.contractCode}
                              </span>

                              {emp.contractName && (
                                <span
                                  className="max-w-[220px] truncate text-[11px] text-on-surface-variant"
                                  title={emp.contractName}
                                >
                                  {emp.contractName}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-on-surface-variant/60">
                              Chưa có dịch vụ
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.badgeClass}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusConfig.dotClass} ${statusConfig.animate ? "animate-pulse" : ""
                                }`}
                            />
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-on-surface-variant font-medium"
                    >
                      Không tìm thấy nhân viên nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline-variant bg-surface-container-low/20 flex justify-center">
            <button
              onClick={() => setIsGuardsModalOpen(true)}
              className="text-secondary cursor-pointer font-bold text-xs hover:underline"
            >
              Xem toàn bộ danh sách
            </button>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="xl:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-on-surface">
              Hoạt động gần đây
            </h3>
            <button className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container-low">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-6 relative flex-1">
            {/* Connecting line for timeline */}
            <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-outline-variant/60" />

            {recentActivitiesLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex gap-4 relative z-10 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-surface-container shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-surface-container rounded w-3/4" />
                    <div className="h-3 bg-surface-container rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : displayedActivities.length > 0 ? (
              displayedActivities.map((act) => {
                const config = getActivityConfig(act.subType);

                return (
                  <div key={act.id} className="flex gap-4 relative z-10">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${config.className}`}>
                      {config.icon}
                    </div>
                    <div>
                      <p className="text-xs text-on-surface font-medium leading-relaxed">
                        {act.boldText && (
                          <span className={`font-bold ${act.type === "report" && act.status === "PENDING" ? "text-red-600" : ""}`}>
                            {act.boldText}
                          </span>
                        )}
                        {act.normalText}
                      </p>
                      <p className="text-[10px] text-on-surface-variant/80 mt-1 font-mono">
                        {act.timeLabel}
                        {act.metaLabel && ` • ${act.metaLabel}`}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-on-surface-variant/60 text-center py-8">
                Không có hoạt động nào gần đây
              </div>
            )}
          </div>
          <button
            onClick={() => setIsActivitiesModalOpen(true)}
            className="mt-6 pt-4 cursor-pointer border-t border-outline-variant/40 text-secondary font-bold text-xs text-center hover:underline"
          >
            Xem tất cả lịch sử
          </button>
        </div>
      </div>

      {/* Modal xem toàn bộ danh sách bảo vệ hôm nay */}
      {isGuardsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/20">
              <div>
                <h3 className="text-lg font-bold text-on-surface">
                  Trạng thái bảo vệ hôm nay
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Danh sách chi tiết toàn bộ nhân viên bảo vệ trong ngày hôm nay
                </p>
              </div>
              <button
                onClick={() => setIsGuardsModalOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter in modal */}
            <div className="p-6 border-b border-outline-variant/40 bg-surface-container-lowest flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 border border-outline-variant rounded px-3 py-1.5 bg-surface-container-lowest w-full sm:w-80 focus-within:border-secondary transition-all">
                <Search className="w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Tìm ID, tên hoặc dịch vụ..."
                  className="bg-transparent border-none p-0 text-xs focus:ring-0 outline-none w-full placeholder-on-surface-variant"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="text-xs text-on-surface-variant font-semibold">
                Hiển thị {filteredEmployees.length} nhân viên
              </div>
            </div>

            {/* Table Area (Scrollable) */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-surface-container-lowest border-b border-outline-variant">
                  <tr className="bg-surface-container-low/80 backdrop-blur-md">
                    <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                      Họ & Tên
                    </th>
                    <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                      Vị trí
                    </th>
                    <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                      Dịch vụ
                    </th>
                    <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp, idx) => {
                      const statusConfig = employeeStatusConfig[emp.status as EmployeeStatus] || {
                        badgeClass: "bg-surface-container text-on-surface-variant border-outline-variant",
                        dotClass: "bg-outline",
                        animate: false,
                      };

                      return (
                        <tr
                          key={`${emp.id}-${idx}`}
                          className="border-b border-outline-variant/30 hover:bg-surface-container-low/40 transition-colors group"
                        >
                          <td className="px-6 py-4 font-mono text-primary font-semibold text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 text-on-surface font-semibold">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-surface-container overflow-hidden shrink-0 border border-outline-variant/30">
                                {emp.avatar ? (
                                  <img
                                    src={emp.avatar}
                                    alt={`Ảnh đại diện của ${emp.name}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-primary-container text-primary flex items-center justify-center text-xs font-bold uppercase">
                                    {emp.name.split(" ").pop()?.substring(0, 2)}
                                  </div>
                                )}
                              </div>
                              <span>{emp.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant text-xs font-medium">
                            {emp.branch}
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant text-xs font-semibold whitespace-nowrap">
                            {emp.timeRange || "Chưa rõ"}
                          </td>
                          <td className="px-6 py-4">
                            {emp.contractCode ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-on-surface">
                                  {emp.contractCode}
                                </span>
                                {emp.contractName && (
                                  <span
                                    className="max-w-[250px] truncate text-[11px] text-on-surface-variant"
                                    title={emp.contractName}
                                  >
                                    {emp.contractName}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-on-surface-variant/60">
                                Chưa có dịch vụ
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.badgeClass}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusConfig.dotClass} ${statusConfig.animate ? "animate-pulse" : ""
                                  }`}
                              />
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-on-surface-variant font-medium"
                      >
                        Không tìm thấy nhân viên nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant bg-surface-container-low/30 flex justify-end gap-2">
              <button
                onClick={() => setIsGuardsModalOpen(false)}
                className="px-4 py-2 border border-outline-variant rounded-md text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal xem toàn bộ hoạt động gần đây */}
      {isActivitiesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/20">
              <div>
                <h3 className="text-lg font-bold text-on-surface">
                  Lịch sử hoạt động gần đây
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Theo dõi chi tiết toàn bộ các hoạt động, sự kiện và thay đổi hệ thống
                </p>
              </div>
              <button
                onClick={() => setIsActivitiesModalOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-4 border-b border-outline-variant/40 bg-surface-container-lowest flex flex-wrap gap-2">
              {[
                { label: "Tất cả", value: "all" },
                { label: "Điểm danh", value: "attendance" },
                { label: "Thay ca", value: "replacement" },
                { label: "Báo cáo", value: "report" },
                { label: "Hợp đồng", value: "contract" },
                { label: "Hệ thống", value: "system" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActivityFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activityFilter === tab.value
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Timeline Scroll Area */}
            <div className="overflow-y-auto flex-1 p-6 relative">
              {filteredActivities.length > 0 && (
                <div className="absolute left-[39px] top-6 bottom-6 w-[1px] bg-outline-variant/60" />
              )}

              <div className="flex flex-col gap-6 relative">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((act) => {
                    const config = getActivityConfig(act.subType);

                    return (
                      <div key={act.id} className="flex gap-4 relative z-10">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${config.className}`}>
                          {config.icon}
                        </div>
                        <div>
                          <p className="text-xs text-on-surface font-medium leading-relaxed">
                            {act.boldText && (
                              <span className={`font-bold ${act.type === "report" && act.status === "PENDING" ? "text-red-600" : ""}`}>
                                {act.boldText}
                              </span>
                            )}
                            {act.normalText}
                          </p>
                          <p className="text-[10px] text-on-surface-variant/80 mt-1 font-mono">
                            {act.timeLabel}
                            {act.metaLabel && ` • ${act.metaLabel}`}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-on-surface-variant/60 text-center py-12">
                    Không có hoạt động nào thuộc danh mục này
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant bg-surface-container-low/30 flex justify-end">
              <button
                onClick={() => setIsActivitiesModalOpen(false)}
                className="px-4 py-2 border border-outline-variant rounded-md text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
