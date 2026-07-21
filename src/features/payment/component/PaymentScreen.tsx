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
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { Button } from "@/components/ui/button";
import {
  requestGetPaymentById,
  requestGetActiveBankAccount,
} from "@/features/payment/api/payment.api";
import { requestGetAllPlans } from "@/features/subscription/api/subscription.api";
import { Plan } from "@/types/Plan";
import { Payment } from "@/types/Payment";
import { BankAccount } from "@/types/BankAccount";
import { useTranslation } from "@/components/providers/LanguageProvider";

// Function to safely parse features from JSONB or string
const parseFeatures = (featuresData: any): string[] => {
  if (!featuresData) return [];
  if (Array.isArray(featuresData)) return featuresData;
  if (typeof featuresData === "object") {
    if (Array.isArray(featuresData.features)) return featuresData.features;
    return [];
  }
  if (typeof featuresData === "string") {
    try {
      const parsed = JSON.parse(featuresData);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.features)) {
        return parsed.features;
      }
      return [featuresData];
    } catch {
      return featuresData.split(",").map((f) => f.trim()).filter(Boolean);
    }
  }
  return [];
};

export default function PaymentScreen() {
  const router = useRouter();
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const { dict } = useTranslation();

  const planId = (routeParams.planId as string) || "doanh-nghiep";
  const paymentId = searchParams.get("paymentId");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [activeBankAccount, setActiveBankAccount] = useState<BankAccount | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Fetch active bank account and plans on mount
  useEffect(() => {
    requestGetActiveBankAccount()
      .then((res) => {
        if (res.success) setActiveBankAccount(res.data);
      })
      .catch((err) => console.error("Error loading active bank account:", err));

    requestGetAllPlans()
      .then((plans) => {
        const found = plans.find((p) => p.plan_id.toString() === planId);
        if (found) setSelectedPlan(found);
        setLoadingPlan(false);
      })
      .catch((err) => {
        console.error("Error loading plans:", err);
        setLoadingPlan(false);
      });
  }, [planId]);

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
            router.push(`/billing/payment/${selectedPlan?.plan_id}/success?paymentId=${payment.payment_id}`);
          }
        } catch (err) {
          console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [payment, router, selectedPlan?.plan_id]);

  // Calculations
  const basePrice = payment ? payment.amount : (selectedPlan?.price ?? 0);
  const totalAmount = basePrice;

  // Bank Details
  const bankCode = activeBankAccount?.bank_code ?? "Vietcombank";
  const bankName = activeBankAccount?.bank_name ?? "Vietcombank - Ngân hàng Ngoại thương";
  const accountNumber = activeBankAccount?.account_number ?? "1903 4567 890 011";
  const accountName = activeBankAccount?.account_name ?? "CÔNG TY TNHH SGCMP ENTERPRISE";
  const transactionCode = payment
    ? payment.transaction_code || ""
    : `SGCMP ORD789${selectedPlan?.plan_id ?? "0"}`;

  // Copy states
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
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
          router.push(`/billing/payment/${selectedPlan?.plan_id}/success?paymentId=${payment.payment_id}`);
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
  const qrCodeUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(transactionCode)}&accountName=${encodeURIComponent(accountName)}`;

  if ((paymentId && loadingPayment && !payment) || loadingPlan) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs text-on-surface-variant font-medium font-body min-h-[400px]">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
        <span>{dict.payment?.loading_tx || "Đang tải thông tin giao dịch..."}</span>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-xs text-on-surface-variant font-medium font-body min-h-[400px] gap-3">
        <div className="text-red-600 font-bold text-base">{dict.payment?.plan_not_found || "Gói dịch vụ không tồn tại"}</div>
        <Button onClick={() => router.push("/billing")} variant="outline" className="h-8 text-xs font-bold mt-2">
          {dict.payment?.back_to_billing || "Quay lại Quản lý gói"}
        </Button>
      </div>
    );
  }

  if (payment && payment.payment_status !== "pending") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-xs text-on-surface-variant font-medium font-body min-h-[400px] gap-3">
        <div className="text-red-600 font-bold text-base">{dict.payment?.payment_unavailable || "Thanh toán không khả dụng"}</div>
        <p>{dict.payment?.payment_unavailable_desc || "Giao dịch này đã được hoàn tất hoặc đã bị hủy."}</p>
        <Button onClick={() => router.push("/billing")} variant="outline" className="h-8 text-xs font-bold mt-2">
          {dict.payment?.back_to_billing || "Quay lại Quản lý gói"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
      {/* Back link */}
      <div>
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{dict.payment?.back_to_billing || "Quay lại Quản lý gói"}</span>
        </Link>
      </div>

      {/* Header Section */}
      <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4">
        <h1 className="text-2xl font-bold text-primary tracking-tight font-headline">
          {dict.payment?.title || "Thanh toán Gói dịch vụ"}
        </h1>
        <p className="text-xs text-on-surface-variant font-body">
          {dict.payment?.subtitle || "Vui lòng hoàn tất quá trình thanh toán để kích hoạt gói dịch vụ của bạn."}
        </p>
      </div>

      {/* Main 2-Column Layout (Matching Screenshot Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Order Summary Card) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-[13px] font-bold text-on-surface uppercase tracking-wider text-on-surface-variant mb-2">
                {selectedPlan.plan_name}
              </h2>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-black text-primary tracking-tight">
                  {formatPrice(basePrice)} đ
                </span>
                <span className="text-xs font-medium text-on-surface-variant">
                  / {dict.payment?.per_month || "tháng"}
                </span>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-3 my-5">
                {parseFeatures(selectedPlan.features).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
                {selectedPlan.max_coordinators !== null && (
                  <li className="flex items-start gap-2.5 text-xs text-on-surface-variant font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{dict.billing?.max_coordinators?.replace("{0}", selectedPlan.max_coordinators.toString()) || `Tối đa ${selectedPlan.max_coordinators} điều phối viên`}</span>
                  </li>
                )}
                {selectedPlan.max_guards !== null && (
                  <li className="flex items-start gap-2.5 text-xs text-on-surface-variant font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{dict.billing?.max_guards?.replace("{0}", selectedPlan.max_guards.toString()) || `Tối đa ${selectedPlan.max_guards} bảo vệ`}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="border-t border-outline-variant/60 pt-4 mt-2 space-y-2.5">
              <div className="flex justify-between text-xs font-medium text-on-surface-variant">
                <span>{dict.payment?.subtotal || "Tạm tính"}</span>
                <span className="font-semibold text-on-surface">{formatPrice(basePrice)} đ</span>
              </div>

              <div className="border-t border-outline-variant/60 pt-3.5 mt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-on-surface">
                  {dict.payment?.total_payment || "Tổng thanh toán"}
                </span>
                <span className="text-2xl font-black text-primary">
                  {formatPrice(totalAmount)} đ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Bank Transfer VietQR Card) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            {/* Header info */}
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <span>{dict.payment?.bank_transfer_qr || "Chuyển khoản ngân hàng (VietQR)"}</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-1 font-medium">
                {dict.payment?.qr_instruction || "Quét mã QR qua ứng dụng ngân hàng hoặc sao chép thông tin bên dưới."}
              </p>
            </div>

            {/* Inner Container Layout */}
            <div className="bg-surface-container-low/50 border border-outline-variant/50 rounded-xl p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* QR Code Column */}
                <div className="md:col-span-5 flex flex-col items-center justify-between gap-3">
                  <div className="w-full bg-white p-3 rounded-xl border border-outline-variant/80 shadow-sm flex flex-col items-center justify-center aspect-square">
                    <img
                      alt="VietQR Code"
                      className="w-full h-full object-contain mix-blend-multiply"
                      src={qrCodeUrl}
                    />
                  </div>
                  <div className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold py-1.5 px-3 rounded-full flex items-center justify-center gap-1.5 w-full text-center">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{dict.payment?.auto_qr_badge || "Mã QR tự động xác nhận"}</span>
                  </div>
                </div>

                {/* Transfer Details Form Fields */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-2.5">
                  {/* Bank Name */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                      {dict.payment?.bank_name || "NGÂN HÀNG"}
                    </label>
                    <div className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold text-on-surface flex items-center justify-between">
                      <span className="truncate">{bankName}</span>
                      <button
                        onClick={() => handleCopy(bankName, "bank")}
                        className="p-1 hover:text-primary transition-colors shrink-0 ml-2"
                        title="Copy"
                      >
                        {copiedField === "bank" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                      </button>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                      {dict.payment?.account_number || "SỐ TÀI KHOẢN"}
                    </label>
                    <div className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm font-bold font-mono text-primary flex items-center justify-between">
                      <span className="tracking-wider">{accountNumber}</span>
                      <button
                        onClick={() => handleCopy(accountNumber, "account")}
                        className="p-1 hover:text-primary transition-colors shrink-0 ml-2"
                        title="Copy"
                      >
                        {copiedField === "account" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                      </button>
                    </div>
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                      {dict.payment?.account_name || "TÊN TÀI KHOẢN"}
                    </label>
                    <div className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs font-bold text-on-surface uppercase flex items-center justify-between">
                      <span className="truncate">{accountName}</span>
                      <button
                        onClick={() => handleCopy(accountName, "name")}
                        className="p-1 hover:text-primary transition-colors shrink-0 ml-2"
                        title="Copy"
                      >
                        {copiedField === "name" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                      {dict.payment?.amount || "SỐ TIỀN"}
                    </label>
                    <div className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs font-bold text-on-surface flex items-center justify-between">
                      <span>{formatPrice(totalAmount)} đ</span>
                      <button
                        onClick={() => handleCopy(totalAmount.toString(), "amount")}
                        className="p-1 hover:text-primary transition-colors shrink-0 ml-2"
                        title="Copy"
                      >
                        {copiedField === "amount" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                      </button>
                    </div>
                  </div>

                  {/* Transfer Content */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                      {dict.payment?.transfer_content || "NỘI DUNG CHUYỂN KHOẢN"}
                    </label>
                    <div className="bg-primary/5 border border-primary/40 rounded-lg px-3 py-2 text-xs font-bold font-mono text-primary flex items-center justify-between">
                      <span className="truncate">{transactionCode}</span>
                      <button
                        onClick={() => handleCopy(transactionCode, "content")}
                        className="p-1 hover:text-primary transition-colors shrink-0 ml-2"
                        title="Copy"
                      >
                        {copiedField === "content" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    </div>
                    <p className="text-[10px] font-medium text-amber-700 mt-1">
                      {dict.payment?.transfer_content_warning || "* Vui lòng nhập chính xác nội dung này để hệ thống xác nhận tự động."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status & Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-outline-variant/60">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                <span>{dict.payment?.waiting_payment || "Hệ thống đang chờ nhận thanh toán..."}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  onClick={handleCompletePayment}
                  disabled={isCompleting}
                  className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-5 py-2 text-xs rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto disabled:opacity-75"
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{dict.payment?.checking_payment || "Đang kiểm tra..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{dict.payment?.confirm_completion || "Xác nhận hoàn tất thanh toán"}</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded border border-red-200">
                {errorMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
