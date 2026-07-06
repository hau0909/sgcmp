"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  QrCode,
  CreditCard,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { Button } from "@/components/ui/button";
import { LANDING_PLANS } from "./plans-data";
import { Payment } from "@/types/Payment";
import {
  requestUpdatePaymentStatus,
  requestGetPaymentById,
} from "@/features/payment/api/payment.api";

interface MockPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
}

const getSelectedPlan = (id: string): MockPlan => {
  const normId = String(id).toLowerCase();

  // Find in LANDING_PLANS
  const found =
    LANDING_PLANS.find(
      (p) =>
        p.id === normId ||
        normId.includes(p.id) ||
        p.id.includes(normId) ||
        (normId === "1" && p.id === "co-ban") ||
        (normId === "2" && p.id === "chuyen-nghiep") ||
        (normId === "3" && p.id === "doanh-nghiep"),
    ) || LANDING_PLANS[2]; // Default to Gói Doanh nghiệp

  return {
    id: found.id,
    name: `Gói ${found.name}`,
    duration: "Gói dịch vụ 1 tháng",
    price: found.priceVal,
    features: found.features,
  };
};

export default function PaymentScreen() {
  const router = useRouter();
  const routeParams = useParams();
  const searchParams = useSearchParams();

  const planId = (routeParams.planId as string) || "doanh-nghiep";
  const paymentId = searchParams.get("paymentId");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Find plan by ID or default to Gói Doanh nghiệp
  const selectedPlan = getSelectedPlan(planId);

  useEffect(() => {
    if (paymentId) {
      setLoadingPayment(true);
      requestGetPaymentById(paymentId)
        .then((res) => {
          if (res.success && res.data) {
            if (res.data.payment_status !== "pending") {
              router.replace("/billing");
              return;
            }
            setPayment(res.data);
          } else {
            router.replace("/billing");
          }
        })
        .catch((err) => {
          console.error("Error loading payment detail:", err);
          router.replace("/billing");
        })
        .finally(() => setLoadingPayment(false));
    } else {
      router.replace("/billing");
    }
  }, [paymentId, router]);

  // Polling mechanism to check payment status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (payment && payment.payment_status === "pending") {
      intervalId = setInterval(async () => {
        try {
          const res = await requestGetPaymentById(payment.payment_id);
          if (res.success && res.data && res.data.payment_status === "completed") {
            clearInterval(intervalId);
            router.push(`/billing/payment/${selectedPlan.id}/success?paymentId=${payment.payment_id}`);
          }
        } catch (err) {
          console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [payment, router, selectedPlan.id]);

  // Calculations
  const basePrice = payment ? payment.amount : selectedPlan.price;
  const vat = 0;
  const discount = 0;
  const totalAmount = basePrice;

  // Static Bank Details
  const bankId = "mbbank";
  const accountNumber = "0852933924";
  const accountName = "NGUYEN DINH HAU";
  const transactionCode = payment
    ? payment.transaction_code || ""
    : `SGCMP ORD789${selectedPlan.id}`;

  // Copy states
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCopy = async (text: string, type: "account" | "content") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "account") {
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2000);
      } else {
        setCopiedContent(true);
        setTimeout(() => setCopiedContent(false), 2000);
      }
    } catch (err) {
      console.error("Tác vụ sao chép thất bại:", err);
    }
  };

  const handleCompletePayment = async () => {
    if (!payment) return;

    try {
      setIsCompleting(true);
      setErrorMsg(null);
      const res = await requestGetPaymentById(payment.payment_id);
      
      if (res.success && res.data) {
        if (res.data.payment_status === "completed") {
           router.push(`/billing/payment/${selectedPlan.id}/success?paymentId=${payment.payment_id}`);
        } else {
           setErrorMsg("Thanh toán chưa được ghi nhận. Vui lòng đợi thêm hoặc kiểm tra lại.");
        }
      } else {
        throw new Error("Không thể kiểm tra trạng thái giao dịch");
      }
    } catch (err: any) {
      console.error("Lỗi kiểm tra thanh toán:", err);
      setErrorMsg(
        err.message ||
          "Đã xảy ra lỗi khi kiểm tra thanh toán. Vui lòng thử lại.",
      );
    } finally {
      setIsCompleting(false);
    }
  };

  // VietQR Image URL
  // Bank name: VCB, Template: compact2
  const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(transactionCode)}&accountName=${encodeURIComponent(accountName)}`;

  if (paymentId && loadingPayment && !payment) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs text-on-surface-variant font-medium font-body min-h-[400px]">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Đang tải thông tin giao dịch...</span>
      </div>
    );
  }

  if (payment && payment.payment_status !== "pending") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-xs text-on-surface-variant font-medium font-body min-h-[400px] gap-3">
        <div className="text-red-600 font-bold text-base">Thanh toán không khả dụng</div>
        <p>Giao dịch này đã được hoàn tất hoặc đã bị hủy.</p>
        <Button onClick={() => router.push("/billing")} variant="outline" className="h-8 text-xs font-bold mt-2">
          Quay lại Quản lý gói
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-360 mx-auto w-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
          <Link
            href="/billing"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Quản lý gói</span>
          </Link>
        </div>
        <h1 className="text-xl font-bold text-primary tracking-tight font-headline mt-1">
          Thanh toán Gói dịch vụ
        </h1>
        <p className="text-xs text-on-surface-variant font-body">
          Vui lòng hoàn tất quá trình thanh toán để kích hoạt gói dịch vụ của
          bạn.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Order Summary & Details */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Order Confirmation Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-5 flex flex-col gap-4 shadow-sm">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Xác nhận dịch vụ</span>
            </h2>

            <div className="bg-surface-container-low rounded-lg p-3.5 border border-outline-variant/50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xs font-bold text-on-surface">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                    {selectedPlan.duration}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary">
                  {formatPrice(basePrice)} VNĐ
                </span>
              </div>

              <ul className="text-[11px] text-on-surface-variant flex flex-col gap-1.5 border-t border-outline-variant/60 pt-3 font-semibold">
                {selectedPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-5 flex flex-col gap-3 shadow-sm">
            <h2 className="text-sm font-bold text-on-surface">
              Chi tiết thanh toán
            </h2>
            <div className="flex flex-col gap-2.5 text-[11px] font-semibold">
              <div className="flex justify-between text-on-surface-variant">
                <span>Tạm tính</span>
                <span>{formatPrice(basePrice)} VNĐ</span>
              </div>

              <div className="border-t border-outline-variant/60 pt-3 mt-1 flex justify-between items-center">
                <span className="text-xs font-bold text-on-surface">
                  Tổng cộng
                </span>
                <span className="text-base font-black text-primary">
                  {formatPrice(totalAmount)} VNĐ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Method (QR & Manual) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-6 flex flex-col gap-6 shadow-sm">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/60 pb-4">
              <div>
                <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span>Phương thức thanh toán</span>
                </h2>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                  Chuyển khoản ngân hàng (VietQR)
                </p>
              </div>
            </div>

            {/* Layout Box */}
            <div className="flex justify-start gap-5 items-end">
              {/* QR Code Column */}
              <div className="flex flex-col items-center gap-3 bg-surface-container-low/60 p-4 rounded-xl border border-outline-variant/50 relative overflow-hidden group">
                <div className="w-50 h-full bg-white p-2 rounded-lg shadow-sm border border-outline-variant/80 relative">
                  <img
                    alt="Mã QR thanh toán VietQR"
                    className="w-full h-full object-cover rounded mix-blend-multiply"
                    src={qrCodeUrl}
                  />
                </div>
              </div>

              {/* Manual Transfer Details */}
              <div className="flex flex-col gap-3 flex-1">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/80 border-b border-outline-variant/40 pb-1">
                  Thông tin chuyển khoản
                </h3>

                <div className="flex flex-col gap-2.5">
                  {/* Bank Name */}
                  <div>
                    <span className="text-[10px] text-on-surface-variant block font-medium">
                      Ngân hàng thụ hưởng
                    </span>
                    <p className="text-xs font-bold text-on-surface mt-0.5">
                      Ngân hàng TMCP Quân đội (MBBank)
                    </p>
                  </div>

                  {/* Account Name */}
                  <div>
                    <span className="text-[10px] text-on-surface-variant block font-medium">
                      Tên tài khoản
                    </span>
                    <p className="text-xs font-bold text-on-surface mt-0.5 uppercase">
                      NGUYEN DINH HAU
                    </p>
                  </div>

                  {/* Account Number */}
                  <div>
                    <span className="text-[10px] text-on-surface-variant block font-medium mb-1">
                      Số tài khoản
                    </span>
                    <div className="flex items-center justify-between bg-surface-container-low px-2.5 py-1 rounded border border-outline-variant/40">
                      <span className="font-mono text-xs font-bold text-primary tracking-wider">
                        {accountNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(accountNumber, "account")}
                        className="text-secondary hover:text-primary transition-colors p-1"
                        title="Sao chép số tài khoản"
                      >
                        {copiedAccount ? (
                          <Check className="w-3.5 h-3.5 text-green-600 animate-scale-in" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <span className="text-[10px] text-on-surface-variant block font-medium">
                      Số tiền
                    </span>
                    <p className="text-xs font-extrabold text-on-surface mt-0.5">
                      {formatPrice(totalAmount)} VNĐ
                    </p>
                  </div>

                  {/* Transaction Code */}
                  <div className="bg-primary/5 p-2 rounded-lg border border-primary/20">
                    <span className="text-[10px] text-on-surface-variant block font-bold mb-1">
                      Nội dung chuyển khoản (Bắt buộc)
                    </span>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-primary/40">
                      <span className="font-mono text-[11px] font-bold text-primary">
                        {transactionCode}
                      </span>
                      <button
                        onClick={() => handleCopy(transactionCode, "content")}
                        className="text-secondary hover:text-primary transition-colors p-1"
                        title="Sao chép nội dung"
                      >
                        {copiedContent ? (
                          <Check className="w-3.5 h-3.5 text-green-600 animate-scale-in" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-outline-variant/60 pt-4 flex flex-col gap-3 mt-1">
              {errorMsg && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded border border-red-200">
                  {errorMsg}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => router.push("/billing")}
                  disabled={isCompleting}
                  className="w-full sm:w-auto font-bold text-xs h-8"
                >
                  Hủy giao dịch
                </Button>
                <Button
                  onClick={handleCompletePayment}
                  disabled={isCompleting}
                  className="bg-primary text-white cursor-pointer w-full sm:w-auto font-bold text-xs h-8 flex items-center justify-center gap-1.5 disabled:opacity-75"
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang kiểm tra...</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang chờ thanh toán...</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
