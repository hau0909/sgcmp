"use client";

import React from "react";
import { Check, Clock, X, FileText, FileSearch, Calculator, FileSignature } from "lucide-react";
import { BookingStatus } from "../types";
import { VerificationStatus } from "@/features/verification/types";
import { useTranslation } from "@/components/providers/LanguageProvider";

type StepState = "completed" | "in-progress" | "error" | "upcoming";

interface StepData {
  id: string;
  title: string;
  description: string;
  state: StepState;
  icon: React.ElementType;
  onClick?: () => void;
  isClickable: boolean;
}

interface BookingProgressProps {
  bookingStatus: BookingStatus;
  verificationStatus: VerificationStatus | null;
  hasContract: boolean;
  onViewVerification?: () => void;
  onViewContract?: () => void;
  isCustomer?: boolean;
  contractStatus?: string | null;
}

export function BookingProgress({
  bookingStatus,
  verificationStatus,
  hasContract,
  onViewVerification,
  onViewContract,
  isCustomer = false,
  contractStatus,
}: BookingProgressProps) {
  const { dict } = useTranslation();
  
  // Step 1: Request
  const step1: StepData = {
    id: "request",
    title: dict.booking.detail.progress.step_request || "Gửi yêu cầu",
    description: dict.booking.detail.progress.desc_request_received || "Đã nhận thông tin",
    state: "completed", // Always completed if we are viewing the booking
    icon: FileText,
    isClickable: false,
  };

  // Step 2: Verification
  let step2State: StepState = "upcoming";
  let step2Desc = dict.booking.detail.progress.desc_ver_upcoming || "Chưa tiến hành";
  if (verificationStatus === "approved") {
    step2State = "completed";
    step2Desc = dict.booking.detail.progress.desc_ver_approved || "Đã duyệt khảo sát";
  } else if (verificationStatus === "rejected") {
    step2State = "error";
    step2Desc = dict.booking.detail.progress.desc_ver_rejected || "Khảo sát bị từ chối";
  } else if (verificationStatus === "pending") {
    step2State = "in-progress";
    step2Desc = dict.booking.detail.progress.desc_ver_pending || "Đang chờ duyệt";
  } else if (verificationStatus === null) {
    step2State = "upcoming";
    step2Desc = dict.booking.detail.progress.desc_ver_upcoming || "Chưa tiến hành";
  }

  const step2: StepData = {
    id: "verification",
    title: dict.booking.detail.progress.step_verification || "Khảo sát",
    description: step2Desc,
    state: step2State,
    icon: FileSearch,
    onClick: onViewVerification,
    isClickable: !!onViewVerification && verificationStatus !== null,
  };

  // Step 3: Quotation
  let step3State: StepState = "upcoming";
  let step3Desc = dict.booking.detail.progress.desc_quote_upcoming || "Chưa báo giá";
  
  if (bookingStatus === "canceled") {
    step3State = "error";
    step3Desc = dict.booking.detail.progress.desc_quote_canceled || "Đã hủy";
  } else if (bookingStatus === "rejected") {
    step3State = "in-progress";
    step3Desc = dict.booking.detail.progress.desc_quote_rejected || "Yêu cầu báo lại";
  } else if (bookingStatus === "accepted") {
    step3State = "completed";
    step3Desc = dict.booking.detail.progress.desc_quote_accepted || "Đã chốt báo giá";
  } else if (bookingStatus === "quoted") {
    step3State = "in-progress";
    step3Desc = dict.booking.detail.progress.desc_quote_quoted || "Chờ khách duyệt";
  } else if (bookingStatus === "pending" && step2State === "completed") {
    step3State = "in-progress";
    step3Desc = dict.booking.detail.progress.desc_quote_pending || "Đang chờ báo giá";
  }

  const step3: StepData = {
    id: "quotation",
    title: dict.booking.detail.progress.step_quotation || "Báo giá",
    description: step3Desc,
    state: step3State,
    icon: Calculator,
    isClickable: false, // Usually no separate page for quotation, it's on this page
  };

  let step4State: StepState = "upcoming";
  let step4Desc = dict.booking.detail.progress.desc_contract_upcoming || "Chưa có hợp đồng";
  
  if (hasContract) {
    if (contractStatus === "pending_signatures") {
      step4State = "in-progress";
      step4Desc = dict.booking.detail.progress.desc_contract_pending || "Đã khởi tạo";
    } else {
      step4State = "completed";
      step4Desc = dict.booking.detail.progress.desc_contract_done || "Đã ký hợp đồng";
    }
  }

  const step4: StepData = {
    id: "contract",
    title: dict.booking.detail.progress.step_contract || "Hợp đồng",
    description: step4Desc,
    state: step4State,
    icon: FileSignature,
    onClick: onViewContract,
    isClickable: !!onViewContract && hasContract,
  };

  const steps = [step1, step2, step3, step4];

  const getStateStyles = (state: StepState, isClickable: boolean) => {
    const baseIcon = "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors shrink-0 z-10";
    const baseText = "text-xs mt-2 font-semibold text-center";
    const baseDesc = "text-[10px] text-center mt-1 w-20 leading-tight";
    
    let containerClass = "flex flex-col items-center relative group";
    if (isClickable) containerClass += " cursor-pointer hover:opacity-80 transition-opacity";

    switch (state) {
      case "completed":
        return {
          container: containerClass,
          icon: `${baseIcon} bg-emerald-50 border-emerald-500 text-emerald-600`,
          text: `${baseText} text-emerald-700`,
          desc: `${baseDesc} text-emerald-600 font-medium`,
          line: "bg-emerald-500",
        };
      case "in-progress":
        return {
          container: containerClass,
          icon: `${baseIcon} bg-amber-50 border-amber-500 text-amber-600`,
          text: `${baseText} text-amber-700`,
          desc: `${baseDesc} text-amber-600 font-medium`,
          line: "bg-amber-300 border-dashed border-2 border-amber-300",
        };
      case "error":
        return {
          container: containerClass,
          icon: `${baseIcon} bg-red-50 border-red-500 text-red-600`,
          text: `${baseText} text-red-700`,
          desc: `${baseDesc} text-red-600 font-medium`,
          line: "bg-red-300",
        };
      case "upcoming":
      default:
        return {
          container: containerClass,
          icon: `${baseIcon} bg-surface-container-high border-outline-variant text-on-surface-variant`,
          text: `${baseText} text-on-surface-variant`,
          desc: `${baseDesc} text-on-surface-variant/70`,
          line: "bg-outline-variant",
        };
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm w-full mb-6 relative overflow-hidden">
      <h3 className="text-sm font-bold text-on-surface mb-5 px-1">Tiến trình xử lý</h3>
      
      <div className="flex items-start justify-between relative px-2 sm:px-6">
        {/* Connecting lines */}
        <div className="absolute top-5 left-10 right-10 flex h-0.5 z-0">
          {steps.map((step, index) => {
            if (index === steps.length - 1) return null;
            const style = getStateStyles(steps[index + 1].state, false);
            // The line takes the color of the NEXT step if it's completed/error, otherwise it's just a dashed line or gray line.
            // If the next step is in-progress, we want a dashed/colored line leading to it.
            let lineClass = "h-0.5 flex-1 bg-outline-variant";
            
            if (step.state === "completed" && steps[index + 1].state === "completed") {
              lineClass = "h-0.5 flex-1 bg-emerald-500";
            } else if (step.state === "completed" && steps[index + 1].state === "in-progress") {
              lineClass = "h-0.5 flex-1 border-t-2 border-dashed border-amber-400";
            } else if (step.state === "completed" && steps[index + 1].state === "error") {
              lineClass = "h-0.5 flex-1 border-t-2 border-dashed border-red-400";
            }

            return <div key={`line-${index}`} className={lineClass}></div>;
          })}
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const styles = getStateStyles(step.state, step.isClickable);
          const Icon = step.icon;
          
          return (
            <div 
              key={step.id} 
              className={styles.container}
              onClick={step.isClickable ? step.onClick : undefined}
            >
              <div className={styles.icon}>
                {step.state === "completed" ? (
                  <Check className="w-5 h-5" />
                ) : step.state === "error" ? (
                  <X className="w-5 h-5" />
                ) : step.state === "in-progress" ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className={styles.text}>{step.title}</div>
              <div className={styles.desc}>{step.description}</div>
              
              {step.isClickable && (
                <div className="absolute -top-2 -right-2 bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Xem
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
