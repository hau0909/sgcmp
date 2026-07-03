import { Review } from "@/types/Review";
import {
  CreateReviewPayload,
  GetAllReviewByCompanyIdParams,
  GetAllReviewByCompanyIdResult,
  GetAverageRatingByCompanyIdResult,
  GetRatingDistributionByCompanyIdResult,
} from "../types";
import {
  insertReview,
  hasExistingReview,
  getReviewsByCompany,
  getAllReviewByCompanyId,
  getAverageRatingByCompanyId,
  getRatingDistributionByCompanyId,
} from "../repository/review.repository";

export async function createReviewService(
  payload: CreateReviewPayload,
): Promise<Review> {
  const exists = await hasExistingReview(payload.contract_id);
  if (exists) {
    throw new Error(
      "Hợp đồng này đã được đánh giá. Bạn không thể đánh giá lại.",
    );
  }

  const review = await insertReview(payload);
  return review;
}

export async function getReviewsByCompanyService(
  companyId: string,
): Promise<Review[]> {
  if (!companyId) {
    throw new Error("companyId is required");
  }

  const reviews = await getReviewsByCompany(companyId);
  return reviews;
}

export const getAllReviewByCompanyIdService = async (
  params: GetAllReviewByCompanyIdParams,
): Promise<GetAllReviewByCompanyIdResult> => {
  return getAllReviewByCompanyId(params);
};

export const getAverageRatingByCompanyIdService = async (
  company_id: string,
): Promise<GetAverageRatingByCompanyIdResult | null> => {
  return getAverageRatingByCompanyId(company_id);
};

export const getRatingDistributionByCompanyIdService = async (
  company_id: string,
): Promise<GetRatingDistributionByCompanyIdResult> => {
  return getRatingDistributionByCompanyId(company_id);
};
