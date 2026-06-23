"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle, X, Loader2, ArrowLeft, FileQuestion, AlertCircle } from "lucide-react";
import { BookingDetailHeader } from "./BookingDetailHeader";
import { BookingCustomerInfo } from "./BookingCustomerInfo";
import { BookingServiceSpec } from "./BookingServiceSpec";
import { BookingQuotationPanel } from "./BookingQuotationPanel";
import { BookingStatus } from "../types";
import { requestGetBookingDetail, requestUpdateBookingQuotation } from "../api/booking.api";

const MOCK_DETAILS: Record<string, any> = {
  "bkg-1": {
    booking_id: "bkg-1",
    customer_name: "Công ty TNHH Vận Tải Đông Á",
    contact_person: "Nguyễn Văn Hùng",
    phone: "0901234567",
    email: "hung.nguyen@donga.com",
    address: "120 Xa Lộ Hà Nội, Thảo Điền, Quận 2, TP. HCM",
    service_name: "Tuần tra ban đêm",
    guards_count: 3,
    start_date: "2026-06-20",
    end_date: "2026-06-30",
    time_slots: ["22:00-06:00"],
    day_per_week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    special_instructions: "Cần bảo vệ tuần tra đêm, tuần tra xung quanh khu văn phòng vào mỗi giờ từ 22h tối đến 6h sáng.",
    quoted_price: 15000000,
    status: "accepted",
    created_at: "2026-06-17T08:00:00Z",
    company_name: "Công ty Cổ phần Dịch vụ Bảo vệ Sài Gòn",
    company_phone: "02838445678",
    company_email: "contact@baovesg.vn",
    company_address: "48 Nguyễn Du, Bến Nghé, Quận 1, TP. HCM"
  },
  "bkg-2": {
    booking_id: "bkg-2",
    customer_name: "Ngân hàng TMCP Việt Á",
    contact_person: "Trần Thị Lan",
    phone: "0918765432",
    email: "lan.tran@vieta.com.vn",
    address: "45 Nguyễn Huệ, Bến Nghé, Quận 1, TP. HCM",
    service_name: "Bảo vệ Văn phòng/Trụ sở",
    guards_count: 2,
    start_date: "2026-07-01",
    end_date: "2026-12-31",
    time_slots: ["07:30-17:30"],
    day_per_week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    special_instructions: "Bảo vệ sảnh chính tòa nhà văn phòng ngân hàng. Yêu cầu ngoại hình lịch sự, biết tiếng Anh cơ bản.",
    quoted_price: 120000000,
    status: "accepted",
    created_at: "2026-06-16T10:30:00Z",
    company_name: "Công ty Cổ phần Dịch vụ Bảo vệ Sài Gòn",
    company_phone: "02838445678",
    company_email: "contact@baovesg.vn",
    company_address: "48 Nguyễn Du, Bến Nghé, Quận 1, TP. HCM"
  },
  "bkg-3": {
    booking_id: "bkg-3",
    customer_name: "Chung cư Cao cấp Landmark",
    contact_person: "Phạm Minh Hoàng",
    phone: "0987654321",
    email: "hoang.pham@landmark.vn",
    address: "208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP. HCM",
    service_name: "An ninh Sự kiện",
    guards_count: 5,
    start_date: "2026-06-25",
    end_date: "2026-06-27",
    time_slots: ["16:00-23:00"],
    day_per_week: ["Friday", "Saturday", "Sunday"],
    special_instructions: "Đội ngũ phản ứng nhanh bảo vệ an ninh sự kiện âm nhạc cuối tuần.",
    quoted_price: 45000000,
    status: "accepted",
    created_at: "2026-06-15T14:15:00Z",
    company_name: "Công ty Cổ phần Dịch vụ Bảo vệ Sài Gòn",
    company_phone: "02838445678",
    company_email: "contact@baovesg.vn",
    company_address: "48 Nguyễn Du, Bến Nghé, Quận 1, TP. HCM"
  },
  "bkg-4": {
    booking_id: "bkg-4",
    customer_name: "Chuỗi Nhà hàng ẩm thực Sen",
    contact_person: "Lê Hoàng Nam",
    phone: "0976543210",
    email: "nam.le@senrestaurants.com",
    address: "78 Lê Lợi, Bến Thành, Quận 1, TP. HCM",
    service_name: "Bảo vệ Mục tiêu Cố định",
    guards_count: 1,
    start_date: "2026-06-10",
    end_date: "2026-06-15",
    time_slots: ["11:00-22:00"],
    day_per_week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    special_instructions: "Bảo vệ nhà hàng ẩm thực vào giờ cao điểm từ trưa đến tối.",
    quoted_price: 6000000,
    status: "accepted",
    created_at: "2026-06-08T09:00:00Z",
    company_name: "Công ty Cổ phần Dịch vụ Bảo vệ Sài Gòn",
    company_phone: "02838445678",
    company_email: "contact@baovesg.vn",
    company_address: "48 Nguyễn Du, Bến Nghé, Quận 1, TP. HCM"
  },
  "bkg-5": {
    booking_id: "bkg-5",
    customer_name: "Trường Tiểu học Quốc tế IQ",
    contact_person: "Đỗ Thùy Chi",
    phone: "0934567890",
    email: "chi.do@iqschool.edu.vn",
    address: "12 Đường Số 4, Linh Chiểu, Thủ Đức, TP. HCM",
    service_name: "An ninh Học đường",
    guards_count: 2,
    start_date: "2026-09-01",
    end_date: "2027-05-31",
    time_slots: ["06:30-18:30"],
    day_per_week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    special_instructions: "Bảo vệ cổng chính trường tiểu học, phân luồng giao thông vào giờ đưa đón học sinh.",
    quoted_price: null,
    status: "accepted",
    created_at: "2026-06-18T07:30:00Z",
    company_name: "Công ty Cổ phần Dịch vụ Bảo vệ Sài Gòn",
    company_phone: "02838445678",
    company_email: "contact@baovesg.vn",
    company_address: "48 Nguyễn Du, Bến Nghé, Quận 1, TP. HCM"
  }
};

interface BookingDetailContainerProps {
  bookingId: string;
}

export function BookingDetailContainer({
  bookingId,
}: BookingDetailContainerProps) {
  const pathname = usePathname();
  const isCoordinator = pathname?.includes("/bookings");
  const isCustomer = pathname?.includes("/my-requests");
  const backUrl = isCoordinator ? "/bookings" : isCustomer ? "/my-requests" : "/requests";
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

  const fetchDetail = React.useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      // Handle UI-only mock IDs
      if (MOCK_DETAILS[bookingId]) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setBooking(MOCK_DETAILS[bookingId]);
        if (MOCK_DETAILS[bookingId].status === "accepted") {
          setContractId("mock-contract-123");
        } else {
          setContractId(null);
        }
        setIsLoading(false);
        return;
      }

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
          company_phone: b.company_phone,
          company_email: b.company_email,
          company_address: b.company_address,
        });
        if (b.contract_id) {
          setContractId(b.contract_id);
        } else {
          setContractId(null);
        }
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

  // Send a quote to the customer using API
  const handleQuote = async (price: number, notes: string) => {
    try {
      setIsSimulating(true);

      // If it is mock, fallback to mock simulation
      if (MOCK_DETAILS[bookingId]) {
        await new Promise((resolve) => setTimeout(resolve, 300));
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
        return;
      }

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
          `Đã cập nhật báo giá ${price.toLocaleString("vi-VN")} VND & gửi phản hồi cho khách hàng thành công!`
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

      // If it is mock, fallback to mock simulation
      if (MOCK_DETAILS[bookingId]) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setBooking((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: "rejected",
          };
        });
        setToastType("success");
        setToastMessage(isCustomer ? "Bạn đã từ chối báo giá thành công." : "Yêu cầu đặt lịch đã bị từ chối thành công.");
        return;
      }

      const updated = await requestUpdateBookingQuotation(bookingId, {
        status: "rejected",
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
        setToastMessage(isCustomer ? "Bạn đã từ chối báo giá thành công." : "Yêu cầu đặt lịch đã bị từ chối thành công.");
      }
    } catch (err: any) {
      console.error("Lỗi khi từ chối yêu cầu:", err);
      setToastType("error");
      setToastMessage(err?.message || "Lỗi khi từ chối yêu cầu.");
    } finally {
      setIsSimulating(false);
    }
  };

  // Accept the booking quotation using API (for customer)
  const handleAcceptQuote = async () => {
    try {
      setIsSimulating(true);

      // If it is mock, fallback to mock simulation
      if (MOCK_DETAILS[bookingId]) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setBooking((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: "accepted",
          };
        });
        setContractId("mock-contract-123");
        setToastType("success");
        setToastMessage("Bạn đã đồng ý báo giá thành công! Hợp đồng đã được tạo tự động.");
        return;
      }

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
        setToastMessage("Bạn đã đồng ý báo giá thành công! Hợp đồng đã được tạo tự động.");
      }
    } catch (err: any) {
      console.error("Lỗi khi đồng ý báo giá:", err);
      setToastType("error");
      setToastMessage(err?.message || "Lỗi khi đồng ý báo giá.");
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
          href={backUrl}
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
          {toastType === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
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
        backUrl={backUrl}
        contractId={contractId}
        isCustomer={!!isCustomer}
      />

      {/* Bento Grid layout matching specs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Customer details & Service specs) */}
        <div className={`${isCoordinator ? "xl:col-span-3" : "xl:col-span-2"} space-y-6`}>
          {/* Customer/Company info card */}
          <BookingCustomerInfo
            customerName={isCustomer ? (booking.company_name || "Doanh nghiệp bảo vệ") : booking.customer_name}
            contactPerson={isCustomer ? "Đại diện doanh nghiệp" : booking.contact_person}
            phone={isCustomer ? (booking.company_phone || "Chưa cập nhật") : booking.phone}
            email={isCustomer ? (booking.company_email || "Chưa cập nhật") : booking.email}
            address={booking.address}
            title={isCustomer ? "Thông tin doanh nghiệp" : "Thông tin khách hàng"}
            nameLabel={isCustomer ? "Tên doanh nghiệp bảo vệ" : "Tên khách hàng / Công ty"}
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
              viewMode={isCustomer ? "customer" : "company"}
              onAccept={handleAcceptQuote}
              contractId={contractId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
