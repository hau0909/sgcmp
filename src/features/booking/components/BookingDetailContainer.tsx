"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, X, Loader2, ArrowLeft, FileQuestion } from "lucide-react";
import { BookingDetailHeader } from "./BookingDetailHeader";
import { BookingCustomerInfo } from "./BookingCustomerInfo";
import { BookingServiceSpec } from "./BookingServiceSpec";
import { BookingQuotationPanel } from "./BookingQuotationPanel";
import { BookingStatus } from "../types";
import { requestGetBookingDetail } from "../api/booking.api";

interface BookingDetailContainerProps {
  bookingId: string;
}

export function BookingDetailContainer({
  bookingId,
}: BookingDetailContainerProps) {
  const [booking, setBooking] = useState<{
    booking_id: string;
    customer_name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    service_name: string;
    guards_count: number;
    start_date: string;
    end_date: string;
    time_slots: string[];
    special_instructions: string | string[] | null;
    quoted_price: number | null;
    status: BookingStatus;
    created_at: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchDetail = React.useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      const res = await requestGetBookingDetail(bookingId);
      if (res && res.booking) {
        const b = res.booking;
        setBooking({
          booking_id: b.booking_id,
          customer_name: b.customer_name,
          contact_person: b.contact_person,
          phone: b.phone,
          email: b.email,
          address: b.address,
          service_name: b.service_name,
          guards_count: b.guards_per_slot || 1,
          start_date: b.start_date,
          end_date: b.end_date,
          time_slots: b.time_slots || [],
          special_instructions: b.description || null,
          quoted_price: b.quoted_price,
          status: b.status,
          created_at: b.created_at,
        });
      } else {
        setError("Không tìm thấy thông tin yêu cầu đặt lịch.");
      }
    } catch (err) {
      const errorObj = err as Error & { message?: string };
      console.error("Lỗi khi tải chi tiết yêu cầu đặt lịch:", errorObj);
      setError(errorObj?.message || "Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      fetchDetail();
    }
  }, [bookingId, fetchDetail]);

  // Trigger local state updates to simulate sending a quote to customer
  const handleQuote = (price: number, notes: string) => {
    setIsSimulating(true);
    // Simulate slight network delay for a high-end feel
    setTimeout(() => {
      setBooking((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: "quoted",
          quoted_price: price,
        };
      });
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
      setBooking((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: "rejected",
        };
      });
      setToastType("success");
      setToastMessage("Yêu cầu đặt lịch đã bị từ chối thành công.");
      setIsSimulating(false);
    }, 600);
  };

  // Clear toast notifications after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="text-sm text-on-surface-variant font-medium">
          Đang tải chi tiết yêu cầu...
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/40">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-2 font-headline">
          Lỗi tải yêu cầu
        </h3>
        <p className="text-sm text-on-surface-variant max-w-xs mb-6 font-body">
          {error || "Rất tiếc, chúng tôi không tìm thấy thông tin yêu cầu được yêu cầu."}
        </p>
        <Link
          href="/requests"
          className="bg-primary hover:bg-primary/95 text-on-primary font-semibold px-4 py-2 rounded-lg text-sm transition-transform active:scale-95 duration-100 flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>
    );
  }


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
