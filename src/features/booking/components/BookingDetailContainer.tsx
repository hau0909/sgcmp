"use client";

import React, { useState } from "react";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { BookingDetailHeader } from "./BookingDetailHeader";
import { BookingCustomerInfo } from "./BookingCustomerInfo";
import { BookingServiceSpec } from "./BookingServiceSpec";
import { BookingQuotationPanel } from "./BookingQuotationPanel";
import { BookingStatus } from "../types";

interface BookingDetailContainerProps {
  bookingId: string;
}

export function BookingDetailContainer({
  bookingId,
}: BookingDetailContainerProps) {
  // Rich mock data simulating a request fetched from Supabase
  const [booking, setBooking] = useState({
    booking_id: bookingId,
    customer_name: "Công ty TNHH Giải pháp Công nghệ ABC",
    contact_person: "Trần Thị B (Giám đốc nhân sự)",
    phone: "090 123 4567",
    email: "contact@abctech.vn",
    address: "Tòa nhà Innovation, 123 Đường Công Nghệ, Quận 7, TP. Hồ Chí Minh",
    service_name: "Bảo vệ sự kiện (Event Security)",
    guards_count: 15,
    start_date: "2023-11-15T00:00:00Z",
    end_date: "2023-11-17T23:59:59Z",
    time_slots: ["08:00 - 22:00"],
    special_instructions: [
      "Yêu cầu 3 nhân sự thông thạo tiếng Anh để đón khách VIP.",
      "Trang phục bảo vệ sự kiện chuẩn (Vest đen, cà vạt).",
      "Cần có 1 đội trưởng quản lý chung tại hiện trường.",
      "Thời gian ca trực từ 08:00 đến 22:00 mỗi ngày.",
    ],
    quoted_price: null as number | null,
    status: "pending" as BookingStatus,
    created_at: "2023-10-24T10:45:00Z",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSimulating, setIsSimulating] = useState(false);

  // Trigger local state updates to simulate sending a quote to customer
  const handleQuote = (price: number, notes: string) => {
    setIsSimulating(true);
    // Simulate slight network delay for a high-end feel
    setTimeout(() => {
      setBooking((prev) => ({
        ...prev,
        status: "quoted",
        quoted_price: price,
      }));
      setToastType("success");
      setToastMessage(
        `Đã cập nhật báo giá ${price.toLocaleString("vi-VN")} VND & gửi phản hồi cho khách hàng thành công!`
      );
      setIsSimulating(false);
    }, 600);
  };

  // Trigger local state updates to simulate rejecting the booking
  const handleReject = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setBooking((prev) => ({
        ...prev,
        status: "rejected",
      }));
      setToastType("success");
      setToastMessage("Yêu cầu đặt lịch đã bị từ chối thành công.");
      setIsSimulating(false);
    }, 600);
  };

  // Clear toast notifications after 4 seconds
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 relative">
      {/* Toast notification component */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold leading-normal">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading wash screen during action simulations */}
      {isSimulating && (
        <div className="fixed inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-xl">
            <Loader2 className="w-5 h-5 animate-spin text-primary-fixed" />
            <span className="text-xs font-bold font-body">Đang xử lý phản hồi...</span>
          </div>
        </div>
      )}

      {/* Page Header Area */}
      <BookingDetailHeader
        bookingId={booking.booking_id}
        status={booking.status}
        createdAt={booking.created_at}
      />

      {/* Bento Grid layout matching specs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Customer details & Service specs) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Customer info card */}
          <BookingCustomerInfo
            customerName={booking.customer_name}
            contactPerson={booking.contact_person}
            phone={booking.phone}
            email={booking.email}
            address={booking.address}
          />

          {/* Service specifications card */}
          <BookingServiceSpec
            serviceName={booking.service_name}
            guardsCount={booking.guards_count}
            startDate={booking.start_date}
            endDate={booking.end_date}
            timeSlots={booking.time_slots}
            specialInstructions={booking.special_instructions}
          />
        </div>

        {/* Right Column (Quotation action card) */}
        <div className="xl:col-span-1">
          <BookingQuotationPanel
            initialPrice={booking.quoted_price}
            guardsCount={booking.guards_count}
            status={booking.status}
            onQuote={handleQuote}
            onReject={handleReject}
          />
        </div>
      </div>
    </div>
  );
}
