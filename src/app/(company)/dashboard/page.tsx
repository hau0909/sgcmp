"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Users,
  Store,
  AlertTriangle,
  Gauge,
  TrendingUp,
  Minus,
  Award,
  Search,
  Filter,
  UserCheck,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  avatar: string | null;
  branch: string;
  status: "Đang trực" | "Sắp đổi ca" | "Nghỉ phép";
}

export default function CompanyDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<"30" | "90">("30");
  const [animateChart, setAnimateChart] = useState(false);

  // Trigger animation for the bars on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimateChart(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const employees: Employee[] = [
    {
      id: "GV-8832",
      name: "Nguyễn Văn An",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB7Xr_F2htXjp8QYyWeMtnS7xE3ZNN5we2hQcw9rfd0cKWKVS9LKfAowTXo34H3M42qQQSwtPRuVtpOAROQazmJ41WMqYMnEnyRLZYQcjuRJ7oiRwVkUa7JjdVgi4-cc6fhip-77Pmv123h0GM9Qbalpz-ILdnG9GS8vj1bGQcr8C9zWgcFutv7ScU8xQ-r7_CvjMmzfHy--K4uvwFFecgRD7XeSOXo75cL13fsXh-B7EbC6xWJ57lXAMaY-8Yff9dllXVX5LYSNFPr",
      branch: "Kho Hàng KV2 - Q7",
      status: "Đang trực",
    },
    {
      id: "GV-9104",
      name: "Trần Thị Bích",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCMeh1yexO2D7QrXiFjLxXCfL-q7pk4GmDYXOV_qvjKzXq21Jb1q-DghaIRcLpby9vz6UwOBPz63QZ5C59ymhoekYkz6cBqF-JOUspaCbJOnlx06IVGjLgnuEWES5BQvUhUt4mX7ufCyn47qxwYtL5IDUFCDgk-4u4TcA0Ke4kdMPvWqUjVO7ToJ6POL86lcRywp9vVuh-7iQXNkVTbi4q1lnfCCOuL6pALGkq4UrEOTfpJA3Un041fueKESVN1HvjDOXR2yGkirezz",
      branch: "Tòa nhà VP Hạng A - Q1",
      status: "Đang trực",
    },
    {
      id: "GV-7421",
      name: "Lê Hoàng Nam",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBHmrwWEY8uz58lSo7WIWlYwD0qsbqixkQ8cxO-FzTjFVmPi5_pQj0IKLoSfTn7zE6eotxxQdzE--56Y1StzR1NjfzzulZOm8CLGIpGnuDZCyibAvrjpwgfa2-wB4BLto9kQIn74br7lHrWCbBdVhGG8PWxMUyIu8Ny_JOa-Aa3H0NKOMpwGJX-ImW1J9_mhaYxVNDIulj5oA1y49AV7aH8PXjpgNu7Ze6g3LBkLGzOcz6Y2dC9QWKr_25zAIYl-bcefsLi-f5lZUIC",
      branch: "Khu dân cư Sunrise",
      status: "Sắp đổi ca",
    },
    {
      id: "GV-8002",
      name: "Phạm Đình Bảo",
      avatar: null,
      branch: "-",
      status: "Nghỉ phép",
    },
  ];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = [
    { label: "T2", height: "85%" },
    { label: "T3", height: "92%" },
    { label: "T4", height: "78%" },
    { label: "T5", height: "88%" },
    { label: "T6", height: "95%" },
    { label: "T7", height: "65%" },
    { label: "CN", height: "50%" },
  ];

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Tổng quan hệ thống</h2>
          <p className="text-sm text-on-surface-variant mt-1">Cập nhật lúc 09:41, Hôm nay</p>
        </div>
        <button className="bg-surface-container-lowest border border-outline-variant text-primary font-medium px-4 py-2 rounded flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm active:scale-95 duration-100">
          <Download className="w-5 h-5" />
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Số lượng nhân viên đang trực
            </span>
            <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl leading-tight font-bold text-on-surface mb-1">
              1,248
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-700 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>+12% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Số lượng chi nhánh h.động
            </span>
            <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-primary">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl leading-tight font-bold text-on-surface mb-1">
              42
            </div>
            <div className="flex items-center gap-1 text-sm text-on-surface-variant font-medium">
              <Minus className="w-4 h-4" />
              <span>Không thay đổi</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Báo cáo sự cố chờ XL
            </span>
            <div className="w-8 h-8 rounded bg-error-container flex items-center justify-center text-error">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl leading-tight font-bold text-error mb-1">
              7
            </div>
            <div className="flex items-center gap-1 text-sm text-error font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>Cần xử lý ngay</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:border-outline transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Điểm hiệu suất TB
            </span>
            <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-primary">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl leading-tight font-bold text-on-surface mb-1">
              94.2%
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-700 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>+1.5% so với tuần trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Subscription Widget */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Operational Overview Chart Container */}
        <div className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-on-surface">
              Tổng quan vận hành: Mức độ tuân thủ ca trực
            </h3>
            <div className="flex gap-2 bg-surface-container rounded p-0.5 border border-outline-variant">
              <button
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors
                  ${
                    timeRange === "30"
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                onClick={() => setTimeRange("30")}
              >
                30 Ngày
              </button>
              <button
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors
                  ${
                    timeRange === "90"
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                onClick={() => setTimeRange("90")}
              >
                90 Ngày
              </button>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="flex-1 flex items-end justify-between gap-2 h-[240px] pt-4 border-b border-outline-variant relative select-none">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-on-surface-variant/70 pb-6 pointer-events-none">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
            </div>
            {/* Chart Bars Grid */}
            <div className="w-full flex justify-between items-end h-full pl-12 pr-2 pb-1 gap-4">
              {chartData.map((bar, idx) => (
                <div key={idx} className="w-full flex flex-col items-center group">
                  <div className="w-full bg-surface-container border border-outline-variant/30 rounded-t h-full flex flex-col justify-end overflow-hidden">
                    <div
                      className="w-full bg-primary rounded-t transition-all duration-700 ease-out origin-bottom"
                      style={{
                        height: animateChart ? bar.height : "0%",
                      }}
                    />
                  </div>
                  <span className="text-xs text-on-surface-variant/80 mt-2 font-semibold">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Quick-View */}
        <div className="xl:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-bold text-on-surface">
                Gói dịch vụ hiện tại
              </h3>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                Active
              </span>
            </div>
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface leading-tight">
                    Premium Enterprise
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Gia hạn: 12/10/2024
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-2 flex justify-between text-xs text-on-surface-variant font-semibold">
              <span>Sử dụng tài nguyên: Nhân viên</span>
              <span className="font-mono">85/100</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2.5 mb-1 overflow-hidden border border-outline-variant/20">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: animateChart ? "85%" : "0%" }}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant/80 text-right mb-6">
              Còn 15 giấy phép
            </p>
          </div>
          <button className="w-full text-center py-2 border border-primary text-primary font-bold rounded hover:bg-surface-container-low transition-colors duration-200 active:scale-98">
            Quản lý giới hạn
          </button>
        </div>
      </div>

      {/* Bottom Section: Guard Status Table & Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Guard Availability/Status Table */}
        <div className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest">
            <h3 className="text-base font-bold text-on-surface">
              Trạng thái nhân viên đang trực
            </h3>
            <div className="flex items-center gap-2 border border-outline-variant rounded px-3 py-1.5 bg-surface-container-lowest w-full sm:w-64 focus-within:border-secondary transition-all">
              <Search className="w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Tìm ID hoặc tên..."
                className="bg-transparent border-none p-0 text-xs focus:ring-0 outline-none w-full placeholder-on-surface-variant"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                  <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                    ID Nhân viên
                  </th>
                  <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                    Họ & Tên
                  </th>
                  <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                    Chi nhánh
                  </th>
                  <th className="px-6 py-3 text-xs uppercase text-on-surface-variant font-bold tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-outline-variant/30 hover:bg-surface-container-low/40 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-primary font-semibold text-xs">
                        {emp.id}
                      </td>
                      <td className="px-6 py-4 text-on-surface font-semibold flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-surface-container overflow-hidden shrink-0 border border-outline-variant/30">
                          {emp.avatar ? (
                            <img
                              src={emp.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary-container text-primary flex items-center justify-center text-xs font-bold uppercase">
                              {emp.name.split(" ").pop()?.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <span>{emp.name}</span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-xs font-medium">
                        {emp.branch}
                      </td>
                      <td className="px-6 py-4">
                        {emp.status === "Đang trực" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />{" "}
                            Đang trực
                          </span>
                        )}
                        {emp.status === "Sắp đổi ca" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />{" "}
                            Sắp đổi ca
                          </span>
                        )}
                        {emp.status === "Nghỉ phép" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />{" "}
                            Nghỉ phép
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
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
            <button className="text-secondary font-bold text-xs hover:underline">
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

            {/* Item 1 */}
            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 shadow-sm">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-on-surface font-medium leading-relaxed">
                  <span className="font-bold">Nguyễn Văn An</span> đã check-in ca
                  trực.
                </p>
                <p className="text-[10px] text-on-surface-variant/80 mt-1 font-mono">
                  09:30 AM • Kho Hàng KV2
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-error-container/20 border border-error-container/30 flex items-center justify-center text-error shrink-0 mt-0.5 shadow-sm">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-on-surface font-medium leading-relaxed">
                  <span className="font-bold text-error">Báo cáo sự cố mới:</span> Mất
                  điện khu vực sảnh chính.
                </p>
                <p className="text-[10px] text-on-surface-variant/80 mt-1 font-mono">
                  08:45 AM • Tòa nhà VP Hạng A
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary shrink-0 mt-0.5 shadow-sm">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-on-surface font-medium leading-relaxed">
                  Yêu cầu đổi ca từ{" "}
                  <span className="font-bold">Lê Hoàng Nam</span> đã được phê duyệt.
                </p>
                <p className="text-[10px] text-on-surface-variant/80 mt-1 font-mono">
                  Hôm qua, 18:20 PM
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary shrink-0 mt-0.5 shadow-sm">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-on-surface font-medium leading-relaxed">
                  Hóa đơn tháng 9 đã được thanh toán tự động.
                </p>
                <p className="text-[10px] text-on-surface-variant/80 mt-1 font-mono">
                  Hôm qua, 00:01 AM
                </p>
              </div>
            </div>
          </div>
          <button className="mt-6 pt-4 border-t border-outline-variant/40 text-secondary font-bold text-xs text-center hover:underline">
            Xem tất cả lịch sử
          </button>
        </div>
      </div>
    </div>
  );
}
