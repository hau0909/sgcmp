import { CreateReviewPayload } from "../types";
import { ReviewApiError } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const FEEDBACK_MAX_LENGTH = 1000;

// ─── Individual validators (return null = ok, string = error message) ─────────

export const validateReviewRating = (rating: number): string | null => {
  if (!rating || rating < 1 || rating > 5)
    return "Vui lòng chọn số sao từ 1 đến 5.";
  return null;
};

export const validateReviewFeedback = (
  comment?: string | null,
): string | null => {
  if (comment && comment.length > FEEDBACK_MAX_LENGTH)
    return `Ý kiến đóng góp không được vượt quá ${FEEDBACK_MAX_LENGTH} ký tự.`;
  return null;
};

// ─── Composite payload validator ──────────────────────────────────────────────

export const validateCreateReviewPayload = (
  payload: CreateReviewPayload,
): void => {
  if (!payload.contract_id || !payload.customer_id || !payload.company_id) {
    throw new ReviewApiError(
      "Thiếu thông tin bắt buộc (hợp đồng, khách hàng, công ty).",
      400,
    );
  }

  const ratingErr = validateReviewRating(payload.rating);
  if (ratingErr) throw new ReviewApiError(ratingErr, 400);

  const feedbackErr = validateReviewFeedback(payload.comment);
  if (feedbackErr) throw new ReviewApiError(feedbackErr, 400);
};
