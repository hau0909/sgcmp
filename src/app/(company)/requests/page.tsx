"use client";

import React, { useState, useMemo } from "react";
import { BookingHeader } from "@/features/booking/components/BookingHeader";
import { BookingFilters } from "@/features/booking/components/BookingFilters";
import { BookingTable } from "@/features/booking/components/BookingTable";
import { Booking, BookingStatus } from "@/features/booking/types";
import { X, Calendar, MapPin, ShieldAlert, Award, RefreshCw, Check, AlertTriangle } from "lucide-react";

// Initial mock data based on the Stitch screen specifications and SQL types
const INITIAL_BOOKINGS: Booking[] = [
  {
    booking_id: "1a87e35b-1111-4444-9999-000000000001",
    customer_id: "customer-1",
    company_id: "company-1",
    service_id: "service-1",
    customer_name: "Tập đoàn Alpha VN",
    service_name: "Bảo vệ Sự kiện (Event Security)",
    address: "123 Lê Lợi, Quận 1, TP. HCM",
    description: "Cần bảo vệ lễ khánh thành nhà máy mới, yêu cầu ăn mặc chỉnh tề, lịch sự.",
    guards_per_slot: 5,
    time_slots: ["08:00 - 12:00", "13:00 - 17:00"],
    start_date: "2023-11-15",
    end_date: "2023-11-20",
    quoted_price: 50000000,
    status: "pending",
    created_at: "2023-10-24T08:00:00Z",
    updated_at: "2023-10-24T08:00:00Z",
  },
  {
    booking_id: "2b98f46c-2222-4444-9999-000000000002",
    customer_id: "customer-2",
    company_id: "company-1",
    service_id: "service-2",
    customer_name: "Ngân hàng Phương Đông",
    service_name: "Hộ tống VIP (VIP Escort)",
    address: "45 Nguyễn Huệ, Quận 1, TP. HCM",
    description: "Hộ tống đoàn chủ tịch cấp cao nước ngoài từ sân bay về trụ sở.",
    guards_per_slot: 2,
    time_slots: ["07:00 - 18:00"],
    start_date: "2023-10-28",
    end_date: "2023-10-29",
    quoted_price: 120000000,
    status: "pending",
    created_at: "2023-10-23T09:15:00Z",
    updated_at: "2023-10-23T09:15:00Z",
  },
  {
    booking_id: "3c09e57d-3333-4444-9999-000000000003",
    customer_id: "customer-3",
    company_id: "company-1",
    service_id: "service-3",
    customer_name: "Khu công nghiệp VSIP",
    service_name: "Tuần tra Khu vực (Area Patrol)",
    address: "Đại lộ Hữu Nghị, Thuận An, Bình Dương",
    description: "Tuần tra ban đêm toàn bộ phân khu B của khu công nghiệp.",
    guards_per_slot: 10,
    time_slots: ["06:00 - 14:00", "14:00 - 22:00", "22:00 - 06:00"],
    start_date: "2023-12-01",
    end_date: "2024-12-01",
    quoted_price: 350000000,
    status: "quoted",
    created_at: "2023-10-20T14:30:00Z",
    updated_at: "2023-10-20T16:00:00Z",
  },
  {
    booking_id: "4d10f68e-4444-4444-9999-000000000004",
    customer_id: "customer-4",
    company_id: "company-1",
    service_id: "service-4",
    customer_name: "TTTM Vincom",
    service_name: "Bảo vệ Cố định (Static Guarding)",
    address: "72 Lê Thánh Tôn, Quận 1, TP. HCM",
    description: "Bảo vệ các sảnh chính và bãi giữ xe, xoay ca liên tục 24/7.",
    guards_per_slot: 4,
    time_slots: ["07:00 - 19:00", "19:00 - 07:00"],
    start_date: "2023-11-01",
    end_date: "2024-11-01",
    quoted_price: 210000000,
    status: "accepted",
    created_at: "2023-10-18T10:00:00Z",
    updated_at: "2023-10-19T11:00:00Z",
  },
  {
    booking_id: "5e21g79f-5555-4444-9999-000000000005",
    customer_id: "customer-5",
    company_id: "company-1",
    service_id: "service-5",
    customer_name: "Công ty TNHH Bất Động Sản XYZ",
    service_name: "Điều tra Cá nhân (Private Inv.)",
    address: "101 Nguyễn Thị Minh Khai, Quận 3, TP. HCM",
    description: "Yêu cầu bảo mật thông tin tuyệt đối.",
    guards_per_slot: 1,
    time_slots: ["08:00 - 17:00"],
    start_date: "2023-10-20",
    end_date: "2023-10-25",
    quoted_price: 15000000,
    status: "rejected",
    created_at: "2023-10-15T09:00:00Z",
    updated_at: "2023-10-16T15:20:00Z",
  },
  {
    booking_id: "6f32h80a-6666-4444-9999-000000000006",
    customer_id: "customer-6",
    company_id: "company-1",
    service_id: "service-6",
    customer_name: "Khách sạn Rex Palace",
    service_name: "Bảo vệ Khách sạn (Hotel Security)",
    address: "141 Nguyễn Huệ, Quận 1, TP. HCM",
    description: "Bảo vệ sảnh đón tiếp khách hàng VIP.",
    guards_per_slot: 3,
    time_slots: ["07:00 - 15:00", "15:00 - 23:00"],
    start_date: "2023-11-01",
    end_date: "2024-05-01",
    quoted_price: 180000000,
    status: "accepted",
    created_at: "2023-10-14T07:10:00Z",
    updated_at: "2023-10-15T08:00:00Z",
  },
  {
    booking_id: "7g43i91b-7777-4444-9999-000000000007",
    customer_id: "customer-7",
    company_id: "company-1",
    service_id: "service-7",
    customer_name: "Siêu thị Co.opmart",
    service_name: "Bảo vệ Siêu thị (Retail Security)",
    address: "189 Cống Quỳnh, Quận 1, TP. HCM",
    description: "Giám sát an ninh khu vực quầy thanh toán và lối ra vào siêu thị.",
    guards_per_slot: 6,
    time_slots: ["08:00 - 22:00"],
    start_date: "2023-10-15",
    end_date: "2024-10-15",
    quoted_price: 240000000,
    status: "quoted",
    created_at: "2023-10-10T08:45:00Z",
    updated_at: "2023-10-11T10:00:00Z",
  },
  {
    booking_id: "8h54j02c-8888-4444-9999-000000000008",
    customer_id: "customer-8",
    company_id: "company-1",
    service_id: "service-8",
    customer_name: "Chung cư Sunrise City",
    service_name: "Tuần tra Toà nhà (Building Patrol)",
    address: "23 Nguyễn Hữu Thọ, Quận 7, TP. HCM",
    description: "Trực chốt bảo vệ cổng ra vào và tuần tra quanh chung cư.",
    guards_per_slot: 8,
    time_slots: ["06:00 - 18:00", "18:00 - 06:00"],
    start_date: "2023-10-20",
    end_date: "2024-10-20",
    quoted_price: 420000000,
    status: "accepted",
    created_at: "2023-10-08T11:20:00Z",
    updated_at: "2023-10-09T09:00:00Z",
  }
];

export default function BookingsPage() {
  // Bookings list state
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 5;

  // Selected Booking for Modal details view
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Interactive details modal inputs
  const [inputPrice, setInputPrice] = useState("");

  // Memoized filtered and searched bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // 1. Search filter
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        const matchesName = booking.customer_name?.toLowerCase().includes(query);
        const matchesAddress = booking.address.toLowerCase().includes(query);
        const matchesCode = `bkg-${booking.booking_id.slice(0, 5)}`.includes(query);
        const matchesService = booking.service_name?.toLowerCase().includes(query);

        if (!matchesName && !matchesAddress && !matchesCode && !matchesService) {
          return false;
        }
      }

      // 2. Status filter
      if (status !== "" && booking.status !== status) {
        return false;
      }

      // 3. Start Date filter (on created_at)
      if (startDate !== "") {
        const queryDate = new Date(startDate);
        const bookingDate = new Date(booking.created_at);
        // Clear times for date comparison
        queryDate.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);
        if (bookingDate < queryDate) return false;
      }

      // 4. End Date filter (on created_at)
      if (endDate !== "") {
        const queryDate = new Date(endDate);
        const bookingDate = new Date(booking.created_at);
        queryDate.setHours(23, 59, 59, 999);
        if (bookingDate > queryDate) return false;
      }

      return true;
    });
  }, [bookings, search, status, startDate, endDate]);

  // Paginated bookings
  const paginatedBookings = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredBookings.slice(startIndex, startIndex + limit);
  }, [filteredBookings, page, limit]);

  // Total count for current filters
  const totalCount = filteredBookings.length;

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setPage(1);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setPage(1);
  };

  // Find active booking details
  const activeBooking = useMemo(() => {
    return bookings.find((b) => b.booking_id === selectedBookingId) || null;
  }, [bookings, selectedBookingId]);

  // Open details modal
  const handleViewDetails = (id: string) => {
    setSelectedBookingId(id);
    const booking = bookings.find((b) => b.booking_id === id);
    if (booking) {
      setInputPrice(booking.quoted_price !== null ? booking.quoted_price.toString() : "");
    }
  };

  // Close details modal
  const handleCloseModal = () => {
    setSelectedBookingId(null);
  };

  // Update quoted price (Gửi báo giá) client-side
  const handleUpdatePrice = () => {
    if (!activeBooking) return;
    const price = parseFloat(inputPrice);
    if (isNaN(price) || price < 0) {
      alert("Vui lòng nhập giá trị hợp lệ!");
      return;
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.booking_id === activeBooking.booking_id
          ? {
              ...b,
              quoted_price: price,
              status: "quoted",
              updated_at: new Date().toISOString(),
            }
          : b
      )
    );
    alert("Cập nhật báo giá thành công!");
  };

  // Approve Booking (Duyệt) client-side
  const handleApprove = () => {
    if (!activeBooking) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.booking_id === activeBooking.booking_id
          ? {
              ...b,
              status: "accepted",
              updated_at: new Date().toISOString(),
            }
          : b
      )
    );
    alert("Đã duyệt yêu cầu đặt lịch này!");
  };

  // Reject Booking (Từ chối) client-side
  const handleReject = () => {
    if (!activeBooking) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.booking_id === activeBooking.booking_id
          ? {
              ...b,
              status: "rejected",
              updated_at: new Date().toISOString(),
            }
          : b
      )
    );
    alert("Đã từ chối yêu cầu đặt lịch này!");
  };

  // Reset Booking status back to pending
  const handleResetStatus = () => {
    if (!activeBooking) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.booking_id === activeBooking.booking_id
          ? {
              ...b,
              status: "pending",
              quoted_price: null,
              updated_at: new Date().toISOString(),
            }
          : b
      )
    );
    setInputPrice("");
  };

  // Export report handler
  const handleExport = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredBookings, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `danh_sach_yeu_cau_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <BookingHeader onExport={handleExport} onCreateNew={() => alert("Chức năng tạo yêu cầu trực tiếp đang được xây dựng!")} />

      {/* Filters Bar */}
      <BookingFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        startDate={startDate}
        onStartDateChange={handleStartDateChange}
        endDate={endDate}
        onEndDateChange={handleEndDateChange}
      />

      {/* Data Table */}
      <BookingTable
        bookings={paginatedBookings}
        totalCount={totalCount}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onViewDetails={handleViewDetails}
      />

      {/* Details Interactive Modal */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-[#c3c6d3] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#eff4ff] border-b border-[#acc7ff] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#024594]">
                <Calendar className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">
                  Chi tiết đặt lịch #BKG-{activeBooking.booking_id.slice(0, 5).toUpperCase()}
                </h3>
              </div>
              <span className="text-xs text-on-surface-variant font-medium ml-auto mr-4 font-mono bg-white/70 px-2 py-0.5 rounded border border-[#acc7ff]/40">
                Cập nhật: {new Date(activeBooking.updated_at).toLocaleDateString("vi-VN")}
              </span>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Profile Card */}
              <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">
                    Khách Hàng
                  </span>
                  <span className="text-base font-bold text-on-surface">
                    {activeBooking.customer_name}
                  </span>
                </div>
                <div className="px-3 py-1 text-xs font-semibold bg-primary-fixed text-on-primary-fixed rounded-full">
                  {activeBooking.service_name}
                </div>
              </div>

              {/* Booking Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase block">Địa chỉ</span>
                    <span className="text-sm font-medium text-on-surface">{activeBooking.address}</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase block">Thời gian thuê</span>
                    <span className="text-sm font-medium text-on-surface">
                      {new Date(activeBooking.start_date).toLocaleDateString("vi-VN")} - {new Date(activeBooking.end_date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* Guard Count */}
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase block">Số lượng bảo vệ</span>
                    <span className="text-sm font-bold text-on-surface">{activeBooking.guards_per_slot} nhân viên / ca trực</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase block">Trạng thái</span>
                    <span className="text-sm font-semibold capitalize text-on-surface">
                      {activeBooking.status === "pending" && "Mới (Chờ xử lý)"}
                      {activeBooking.status === "quoted" && "Đã báo giá"}
                      {activeBooking.status === "accepted" && "Đã duyệt"}
                      {activeBooking.status === "rejected" && "Từ chối"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Slots Pills */}
              <div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Khung giờ làm việc trong ngày
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeBooking.time_slots.map((slot, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs font-semibold bg-surface-container-high border border-outline-variant/40 rounded-lg text-on-surface"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              {activeBooking.description && (
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Ghi chú từ khách hàng
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-body">
                    {activeBooking.description}
                  </p>
                </div>
              )}

              {/* Interactive Price Form */}
              <div className="border-t border-outline-variant/40 pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Giá trị báo giá (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        disabled={activeBooking.status === "accepted" || activeBooking.status === "rejected"}
                        value={inputPrice}
                        onChange={(e) => setInputPrice(e.target.value)}
                        placeholder="Nhập số tiền báo giá..."
                        className="w-full px-3 h-[38px] bg-surface-container-lowest border border-outline-variant rounded text-sm font-semibold text-on-surface focus:outline-none focus:border-primary disabled:bg-surface-container-low disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  {/* Action button inside form */}
                  {(activeBooking.status === "pending" || activeBooking.status === "quoted") && (
                    <button
                      onClick={handleUpdatePrice}
                      className="w-full sm:w-auto h-[38px] px-5 bg-secondary text-on-secondary font-bold text-sm rounded hover:bg-secondary-container transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 duration-100"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Gửi Báo Giá</span>
                    </button>
                  )}
                </div>

                {/* Approve/Reject Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {activeBooking.status === "quoted" && (
                    <>
                      <button
                        onClick={handleApprove}
                        className="flex-1 h-[40px] bg-[#024594] hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 duration-100"
                      >
                        <Check className="w-4.5 h-4.5" />
                        <span>Duyệt Yêu Cầu</span>
                      </button>
                      <button
                        onClick={handleReject}
                        className="flex-1 h-[40px] border border-slate-200 hover:bg-slate-100 text-[#ba1a1a] font-semibold text-sm rounded transition-colors cursor-pointer flex items-center justify-center gap-2 duration-100"
                      >
                        <AlertTriangle className="w-4.5 h-4.5" />
                        <span>Từ Chối</span>
                      </button>
                    </>
                  )}

                  {/* Reset/Demo action button */}
                  {(activeBooking.status === "accepted" || activeBooking.status === "rejected") && (
                    <div className="w-full flex flex-col gap-2">
                      <div className="text-xs text-[#b45309] bg-[#fffbeb] border border-[#fde68a] p-3 rounded-lg leading-normal flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-[#d97706] mt-0.5" />
                        <span>
                          {activeBooking.status === "accepted" ? (
                            <span>✓ Hợp đồng đã được duyệt thành công và chuyển sang trạng thái ký kết</span>
                          ) : (
                            <span>✗ Yêu cầu đặt lịch đã bị từ chối bởi công ty</span>
                          )}
                        </span>
                      </div>
                      <button
                        onClick={handleResetStatus}
                        className="w-full h-[36px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        Đặt lại Trạng thái (Demo)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
