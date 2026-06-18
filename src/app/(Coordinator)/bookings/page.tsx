"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { BookingHeader } from "@/features/booking/components/BookingHeader";
import { BookingTable } from "@/features/booking/components/BookingTable";
import { Booking } from "@/features/booking/types";

// Mock data for Coordinator Bookings view (Accepted status with active contracts only)
const MOCK_BOOKINGS: Booking[] = [
  {
    booking_id: "bkg-1",
    customer_id: "cust-1",
    company_id: "9b9da580-1a8b-4394-87c4-ebcba555ffe5",
    service_id: "svc-1",
    address: "120 Xa Lộ Hà Nội, Thảo Điền, Quận 2, TP. HCM",
    description: "Cần bảo vệ tuần tra đêm, tuần tra xung quanh khu văn phòng vào mỗi giờ từ 22h tối đến 6h sáng.",
    guards_per_slot: 3,
    time_slots: ["22:00-06:00"],
    start_date: "2026-06-20",
    end_date: "2026-06-30",
    quoted_price: 15000000,
    status: "accepted",
    created_at: "2026-06-17T08:00:00Z",
    updated_at: "2026-06-17T08:00:00Z",
    customer_name: "Công ty TNHH Vận Tải Đông Á",
    service_name: "Tuần tra ban đêm"
  },
  {
    booking_id: "bkg-2",
    customer_id: "cust-2",
    company_id: "9b9da580-1a8b-4394-87c4-ebcba555ffe5",
    service_id: "svc-2",
    address: "45 Nguyễn Huệ, Bến Nghé, Quận 1, TP. HCM",
    description: "Bảo vệ sảnh chính tòa nhà văn phòng ngân hàng. Yêu cầu ngoại hình lịch sự, biết tiếng Anh cơ bản.",
    guards_per_slot: 2,
    time_slots: ["07:30-17:30"],
    start_date: "2026-07-01",
    end_date: "2026-12-31",
    quoted_price: 120000000,
    status: "accepted",
    created_at: "2026-06-16T10:30:00Z",
    updated_at: "2026-06-16T10:30:00Z",
    customer_name: "Ngân hàng TMCP Việt Á",
    service_name: "Bảo vệ Văn phòng/Trụ sở"
  },
  {
    booking_id: "bkg-3",
    customer_id: "cust-3",
    company_id: "9b9da580-1a8b-4394-87c4-ebcba555ffe5",
    service_id: "svc-3",
    address: "208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP. HCM",
    description: "Đội ngũ phản ứng nhanh bảo vệ an ninh sự kiện âm nhạc cuối tuần.",
    guards_per_slot: 5,
    time_slots: ["16:00-23:00"],
    start_date: "2026-06-25",
    end_date: "2026-06-27",
    quoted_price: 45000000,
    status: "accepted",
    created_at: "2026-06-15T14:15:00Z",
    updated_at: "2026-06-15T14:15:00Z",
    customer_name: "Chung cư Cao cấp Landmark",
    service_name: "An ninh Sự kiện"
  },
  {
    booking_id: "bkg-4",
    customer_id: "cust-4",
    company_id: "9b9da580-1a8b-4394-87c4-ebcba555ffe5",
    service_id: "svc-4",
    address: "78 Lê Lợi, Bến Thành, Quận 1, TP. HCM",
    description: "Bảo vệ nhà hàng ẩm thực vào giờ cao điểm từ trưa đến tối.",
    guards_per_slot: 1,
    time_slots: ["11:00-22:00"],
    start_date: "2026-06-10",
    end_date: "2026-06-15",
    quoted_price: 6000000,
    status: "accepted",
    created_at: "2026-06-08T09:00:00Z",
    updated_at: "2026-06-08T09:00:00Z",
    customer_name: "Chuỗi Nhà hàng ẩm thực Sen",
    service_name: "Bảo vệ Mục tiêu Cố định"
  },
  {
    booking_id: "bkg-5",
    customer_id: "cust-5",
    company_id: "9b9da580-1a8b-4394-87c4-ebcba555ffe5",
    service_id: "svc-5",
    address: "12 Đường Số 4, Linh Chiểu, Thủ Đức, TP. HCM",
    description: "Bảo vệ cổng chính trường tiểu học, phân luồng giao thông vào giờ đưa đón học sinh.",
    guards_per_slot: 2,
    time_slots: ["06:30-18:30"],
    start_date: "2026-09-01",
    end_date: "2027-05-31",
    quoted_price: null,
    status: "accepted",
    created_at: "2026-06-18T07:30:00Z",
    updated_at: "2026-06-18T07:30:00Z",
    customer_name: "Trường Tiểu học Quốc tế IQ",
    service_name: "An ninh Học đường"
  }
];

export default function CoordinatorBookingsPage() {
  const router = useRouter();

  // Local state for pagination and filtering
  const [page, setPage] = useState(1);
  const limit = 8;

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Handler for filter changes
  const handleSearchChange = (val: string) => {
    setSearch(val);
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

  // Export report handler (simulated)
  const handleExport = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(MOCK_BOOKINGS, null, 2),
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute(
      "download",
      `don_yeu_cau_dieu_phoi_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <BookingHeader
        onExport={handleExport}
        onCreateNew={() =>
          alert("Điều phối viên không có quyền trực tiếp tạo đơn mới! Vui lòng liên hệ Admin hoặc Khách hàng.")
        }
      />

      {/* Filters Bar (No status dropdown) */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-7 flex flex-col">
            <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[16px] h-[16px]" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Mã Booking, Khách Hàng, Dịch Vụ, Địa Chỉ..."
                className="w-full pl-9 pr-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="md:col-span-5 flex gap-3">
            <div className="flex-1 flex flex-col">
              <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Từ ngày gửi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Đến ngày gửi
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <BookingTable
        bookings={MOCK_BOOKINGS}
        totalCount={MOCK_BOOKINGS.length}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onViewDetails={(id) => router.push(`/bookings/${id}`)}
      />
    </div>
  );
}
