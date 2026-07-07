"use client";

import React, { useState } from "react";
import { Star, Send, Calendar, AlertCircle, CheckCircle2, X } from "lucide-react";
import { FEEDBACK_MAX_LENGTH } from "../validator/review.validator";

interface CustomerQualityReviewModalProps {
  contractCode: string;
  companyName?: string;
  startDate?: string | null;
  endDate?: string | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
  isReadOnly?: boolean;
  initialRating?: number;
  initialFeedback?: string;
}

export function CustomerQualityReviewModal({
  contractCode,
  companyName,
  startDate,
  endDate,
  onClose,
  onSubmit,
  isReadOnly = false,
  initialRating = 0,
  initialFeedback = "",
}: CustomerQualityReviewModalProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const dateRange = `${formatDate(startDate)} – ${formatDate(endDate)}`;
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ─── Derived validation ───────────────────────────────────────────────────
  const feedbackError =
    feedback.length > FEEDBACK_MAX_LENGTH
      ? `Ý kiến đóng góp không được vượt quá ${FEEDBACK_MAX_LENGTH} ký tự.`
      : null;

  const canSubmit = rating > 0 && !feedbackError && !isSubmitting;

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ rating, feedback });
      setShowSuccess(true);
      window.dispatchEvent(new CustomEvent("reviewSubmitted"));
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err: any) {
      setSubmitError(err?.message || "Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    label,
    description,
    value,
    hoverValue,
    onValueChange,
    onHoverChange,
  }: {
    label: string;
    description?: string;
    value: number;
    hoverValue: number;
    onValueChange: (val: number) => void;
    onHoverChange: (val: number) => void;
  }) => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-body text-[16px] font-semibold text-primary">
            {label}
          </label>
          {description && (
            <p className="font-body text-[13px] text-on-surface-variant">{description}</p>
          )}
        </div>
        
        <div className="flex gap-3 text-outline-variant justify-center pt-2 pb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              onMouseEnter={() => !isReadOnly && onHoverChange(star)}
              onMouseLeave={() => !isReadOnly && onHoverChange(0)}
              onClick={() => !isReadOnly && onValueChange(value === star ? 0 : star)}
              className={`transition-all duration-200 w-12 h-12 ${!isReadOnly ? 'cursor-pointer hover:scale-110' : ''} ${
                (hoverValue || value) >= star
                  ? "text-amber-500 fill-amber-500"
                  : "text-outline-variant"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
        {/* Review Form Container */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg w-full max-w-2xl overflow-hidden flex flex-col shadow-sm animate-in zoom-in-95 duration-200">
          
          {/* Header Section */}
          <div className="bg-surface-container-lowest border-b border-outline-variant p-6">
            <h2 className="font-headline text-[24px] font-semibold tracking-tight text-on-surface mb-2">
              Đánh giá chất lượng dịch vụ
            </h2>
            <div className="bg-surface-container-low border border-surface-variant rounded p-3 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                {companyName && (
                  <span className="font-body text-[14px] font-semibold text-on-surface">{companyName}</span>
                )}
                <span className="font-mono text-[13px] text-secondary">#{contractCode}</span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant text-[13px]">
                <Calendar className="w-[16px] h-[16px]" />
                <span>{dateRange}</span>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 flex flex-col gap-8 bg-surface-container-lowest">
            
            {/* Rating Criteria */}
            <div className="flex flex-col gap-4">
              <StarRating
                label="Mức độ hài lòng chung"
                description="Vui lòng để lại đánh giá của bạn về tổng thể chất lượng dịch vụ."
                value={rating}
                hoverValue={hover}
                onValueChange={setRating}
                onHoverChange={setHover}
              />
            </div>

            {/* Feedback Section */}
            <div className="flex flex-col gap-6">
              <h3 className="font-label text-[12px] font-medium tracking-widest uppercase text-outline">
                Ý kiến đóng góp
              </h3>
              <div className="flex flex-col gap-1">
                <textarea
                  value={feedback}
                  onChange={handleFeedbackChange}
                  readOnly={isReadOnly}
                  className={`w-full min-h-[120px] rounded border bg-surface-bright p-3 text-[14px] text-on-surface placeholder:text-outline focus:ring-1 outline-none transition-colors resize-y disabled:opacity-70 disabled:cursor-not-allowed read-only:bg-surface-container-low read-only:cursor-default read-only:focus:ring-0 read-only:focus:border-outline-variant ${
                    feedbackError
                      ? "border-error focus:border-error focus:ring-error/30"
                      : "border-outline-variant focus:border-secondary focus:ring-secondary"
                  }`}
                  placeholder={isReadOnly ? "Không có đánh giá chi tiết." : "Chia sẻ thêm trải nghiệm của bạn về dịch vụ hoặc những điểm chúng tôi có thể cải thiện..."}
                ></textarea>

                {/* Character counter + error */}
                <div className="flex items-start justify-between gap-2">
                  {feedbackError ? (
                    <p className="flex items-center gap-1 text-[12px] text-error">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {feedbackError}
                    </p>
                  ) : (
                    <div />
                  )}
                  {!isReadOnly && (
                    <span className={`text-[12px] shrink-0 ${feedbackError ? "text-error font-semibold" : "text-on-surface-variant"}`}>
                      {feedback.length}/{FEEDBACK_MAX_LENGTH}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit error banner */}
            {submitError && (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-error bg-error/5 text-sm text-error">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-surface-container-low border-t border-outline-variant p-6 flex items-center justify-end gap-3">
            {isReadOnly ? (
              <button
                onClick={onClose}
                className="px-6 py-2 rounded font-body text-[14px] font-medium text-on-primary bg-primary hover:bg-primary-container transition-colors shadow-sm"
              >
                Đóng
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded font-body text-[14px] font-medium text-secondary border border-secondary hover:bg-surface-dim transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="px-6 py-2 rounded font-body text-[14px] font-medium text-on-primary bg-primary hover:bg-primary-container disabled:opacity-70 transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-[18px] h-[18px]" />
                      Gửi đánh giá
                    </>
                  )}
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ─── Success Toast (đồng nhất với AddCoordinatorForm) ──────────────── */}
      {showSuccess && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-[60] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold leading-normal">
            Gửi đánh giá thành công!
          </span>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            className="text-white/60 hover:text-white ml-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
