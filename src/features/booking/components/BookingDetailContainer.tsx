"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CheckCircle,
  X,
  Loader2,
  ArrowLeft,
  FileQuestion,
  AlertCircle,
} from "lucide-react";
import { BookingDetailHeader } from "./BookingDetailHeader";
import { BookingCustomerInfo } from "./BookingCustomerInfo";
import { BookingServiceSpec } from "./BookingServiceSpec";
import { BookingQuotationPanel } from "./BookingQuotationPanel";
import { BookingStatus } from "../types";
import {
  requestGetBookingDetail,
  requestUpdateBookingQuotation,
} from "../api/booking.api";
import { requestGetVerification } from "@/features/verification/api/verification.api";
import { VerificationStatus } from "@/features/verification/types";
import { BookingProgress } from "./BookingProgress";
import { useTranslation } from "@/components/providers/LanguageProvider";


interface BookingDetailContainerProps {
  bookingId: string;
}

export function BookingDetailContainer({
  bookingId,
}: BookingDetailContainerProps) {
  const { dict } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const isCoordinator = pathname?.includes("/bookings");
  const isCustomer = pathname?.includes("/my-requests");
  const backUrl = isCoordinator
    ? "/bookings"
    : isCustomer
      ? "/my-requests"
      : "/requests";
  // Verification route based on layout context
  const verificationBasePath = isCoordinator
    ? "/coor-verifications"
    : "/verifications";
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
    day_per_week: string[];
    company_name?: string;
    company_contact_person?: string;
    company_phone?: string;
    company_email?: string;
    company_address?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSimulating, setIsSimulating] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);
  const [contractStatus, setContractStatus] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);
  const [isCreatingVerification, setIsCreatingVerification] = useState(false);

  const fetchDetail = React.useCallback(
    async (showLoading = true) => {
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
            day_per_week: b.day_per_week || [],
            company_name: b.company_name,
            company_contact_person: b.company_contact_person,
            company_phone: b.company_phone,
            company_email: b.company_email,
            company_address: b.company_address,
          });
          if (b.contract_id) {
            setContractId(b.contract_id);
            setContractStatus(b.contract_status || null);
          } else {
            setContractId(null);
            setContractStatus(null);
          }

          try {
            const vRes = await requestGetVerification(bookingId);
            if (vRes && vRes.verification) {
              setVerificationStatus(vRes.verification.status);
            }
          } catch (e) {
            console.error("Failed to fetch verification status", e);
          }
        } else {
          setError(
            dict.booking.detail.toasts.not_found_error ||
              "Không tìm thấy thông tin yêu cầu đặt lịch.",
          );
        }
      } catch (err) {
        const errorObj = err as Error & { message?: string };
        console.error("Lỗi khi tải chi tiết yêu cầu đặt lịch:", errorObj);
        setError(
          errorObj?.message ||
            dict.booking.detail.toasts.network_error ||
            "Lỗi kết nối máy chủ",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [bookingId],
  );

  useEffect(() => {
    if (bookingId) {
      fetchDetail();
    }
  }, [bookingId, fetchDetail]);

  // Send a quote to the customer using API
  const handleQuote = async (price: number) => {
    try {
      setIsSimulating(true);


      const updated = await requestUpdateBookingQuotation(bookingId, {
        status: "quoted",
        quoted_price: price,
      });

      if (updated && updated.booking) {
        setBooking((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: updated.booking.status,
            quoted_price: updated.booking.quoted_price,
          };
        });
        setToastType("success");
        setToastMessage(
          dict.booking.detail.toasts.quote_updated_success?.replace(
            "{price}",
            price.toLocaleString("vi-VN"),
          ) ||
            `Đã cập nhật báo giá ${price.toLocaleString("vi-VN")} VND & gửi phản hồi cho khách hàng thành công!`,
        );
      }
    } catch (err: any) {
      console.error("Lỗi khi gửi báo giá:", err);
      setToastType("error");
      setToastMessage(err?.message || "Lỗi khi cập nhật báo giá.");
    } finally {
      setIsSimulating(false);
    }
  };

  // Reject the booking using API
  const handleReject = async () => {
    try {
      setIsSimulating(true);

      const targetStatus = isCustomer ? "rejected" : "canceled";
      const updated = await requestUpdateBookingQuotation(bookingId, {
        status: targetStatus,
      });

      if (updated && updated.booking) {
        setBooking((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: updated.booking.status,
          };
        });
        setToastType("success");
        setToastMessage(
          isCustomer
            ? dict.booking.detail.toasts.reject_quote_success_customer ||
                "Bạn đã từ chối báo giá thành công."
            : dict.booking.detail.toasts.reject_quote_success_company ||
                "Yêu cầu đặt lịch đã bị từ chối thành công.",
        );
      }
    } catch (err: any) {
      console.error("Lỗi khi từ chối yêu cầu:", err);
      setToastType("error");
      setToastMessage(
        err?.message ||
          dict.booking.detail.toasts.reject_quote_error ||
          "Lỗi khi từ chối yêu cầu.",
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setIsSimulating(true);


      const updated = await requestUpdateBookingQuotation(bookingId, {
        status: "canceled",
      });

      if (updated && updated.booking) {
        setBooking((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: updated.booking.status,
          };
        });
        setToastType("success");
        setToastMessage(
          dict.booking.detail.toasts.cancel_success ||
            "Bạn đã hủy yêu cầu thành công.",
        );
      }
    } catch (err: any) {
      console.error("Lỗi khi hủy yêu cầu:", err);
      setToastType("error");
      setToastMessage(
        err?.message ||
          dict.booking.detail.toasts.cancel_error ||
          "Lỗi khi hủy yêu cầu.",
      );
    } finally {
      setIsSimulating(false);
    }
  };

  // Accept the booking quotation using API (for customer)
  const handleAcceptQuote = async () => {
    try {
      setIsSimulating(true);


      const res = await requestUpdateBookingQuotation(bookingId, {
        status: "accepted",
      });

      if (res && res.booking) {
        setBooking((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: res.booking.status,
          };
        });
        if (res.contract_id) {
          setContractId(res.contract_id);
        }
        setToastType("success");
        setToastMessage(
          dict.booking.detail.toasts.accept_quote_success ||
            "Bạn đã đồng ý báo giá thành công! Hợp đồng đã được tạo tự động.",
        );
      }
    } catch (err: any) {
      console.error("Lỗi khi đồng ý báo giá:", err);
      setToastType("error");
      setToastMessage(
        err?.message ||
          dict.booking.detail.toasts.accept_quote_error ||
          "Lỗi khi đồng ý báo giá.",
      );
    } finally {
      setIsSimulating(false);
    }
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
          {dict.booking.form.loading_detail || "Đang tải chi tiết yêu cầu..."}
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
          {dict.booking.detail.loading.error_title || "Lỗi tải yêu cầu"}
        </h3>
        <p className="text-sm text-on-surface-variant max-w-xs mb-6 font-body">
          {error ||
            dict.booking.detail.loading.error_desc ||
            "Rất tiếc, chúng tôi không tìm thấy thông tin yêu cầu được yêu cầu."}
        </p>
        <Link
          href={backUrl}
          className="bg-primary hover:bg-primary/95 text-on-primary font-semibold px-4 py-2 rounded-lg text-sm transition-transform active:scale-95 duration-100 flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {dict.booking.detail.loading.back_to_list || "Quay lại danh sách"}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 relative">
      {/* Toast notification component */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {toastType === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold leading-normal">
            {toastMessage}
          </span>
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
            <span className="text-xs font-bold font-body">
              {dict.booking.detail.loading.simulating_feedback ||
                "Đang xử lý phản hồi..."}
            </span>
          </div>
        </div>
      )}

      {/* Page Header Area */}
      <BookingDetailHeader
        bookingId={bookingId}
        status={booking.status}
        createdAt={booking.created_at}
        backUrl={backUrl}
        contractId={contractId}
        isCustomer={isCustomer}
        verificationStatus={verificationStatus}
        onCancelBooking={handleCancelBooking}
        isCreatingVerification={isCreatingVerification}
        onCreateVerification={async () => {
          try {
            setIsCreatingVerification(true);
            const { requestCreateVerificationSession } =
              await import("@/features/verification/api/verification.api");
            const res = await requestCreateVerificationSession(bookingId);
            setVerificationStatus(res.verification.status);
            router.push(`${verificationBasePath}/${bookingId}`);
          } catch (err: any) {
            console.error("Tạo khảo sát thất bại:", err);
          } finally {
            setIsCreatingVerification(false);
          }
        }}
        onViewVerification={() =>
          router.push(`${verificationBasePath}/${bookingId}`)
        }
      />

      {/* State Progress Bar */}
      {booking && (
        <BookingProgress
          bookingStatus={booking.status}
          verificationStatus={verificationStatus}
          hasContract={!!contractId}
          contractStatus={contractStatus}
          onViewVerification={
            verificationStatus !== null ? () => router.push(`${verificationBasePath}/${bookingId}`) : undefined
          }
          onViewContract={() => {
            // TODO: Navigate to contract page if needed
          }}
          isCustomer={isCustomer}
        />
      )}

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Customer details & Service specs) */}
        <div
          className={`${isCoordinator ? "xl:col-span-3" : "xl:col-span-2"} space-y-6`}
        >
          {/* Customer/Company info card */}
          <BookingCustomerInfo
            customerName={
              isCustomer
                ? booking.company_name ||
                  dict.booking.detail.info.default_company ||
                  "Doanh nghiệp bảo vệ"
                : booking.customer_name
            }
            contactPerson={
              isCustomer
                ? booking.company_contact_person || dict.booking.detail.info.company_rep || "Đại diện doanh nghiệp"
                : booking.contact_person
            }
            phone={
              isCustomer
                ? booking.company_phone ||
                  dict.booking.detail.info.not_updated ||
                  "Chưa cập nhật"
                : booking.phone
            }
            email={
              isCustomer
                ? booking.company_email ||
                  dict.booking.detail.info.not_updated ||
                  "Chưa cập nhật"
                : booking.email
            }
            address={booking.address}
            title={
              isCustomer
                ? dict.booking.detail.info.company_info_title ||
                  "Thông tin doanh nghiệp"
                : dict.booking.detail.info.customer_info_title ||
                  "Thông tin khách hàng"
            }
            nameLabel={
              isCustomer
                ? dict.booking.detail.info.company_name ||
                  "Tên doanh nghiệp bảo vệ"
                : dict.booking.detail.info.customer_name ||
                  "Tên khách hàng / Công ty"
            }
          />

          {/* Service specifications card */}
          <BookingServiceSpec
            serviceName={booking.service_name}
            guardsCount={booking.guards_count}
            startDate={booking.start_date}
            endDate={booking.end_date}
            timeSlots={booking.time_slots}
            day_per_week={booking.day_per_week}
            specialInstructions={booking.special_instructions}
          />
        </div>

        {/* Right Column (Quotation action card - only for Company side) */}
        {!isCoordinator && (
          <div className="xl:col-span-1">
            <BookingQuotationPanel
              initialPrice={booking.quoted_price}
              guardsCount={booking.guards_count}
              status={booking.status}
              onQuote={handleQuote}
              onReject={handleReject}
              onCancelBooking={handleCancelBooking}
              viewMode={isCustomer ? "customer" : "company"}
              onAccept={handleAcceptQuote}
              contractId={contractId}
              verificationStatus={verificationStatus}
            />
          </div>
        )}
      </div>
    </div>
  );
}
