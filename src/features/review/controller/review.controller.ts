import { Review } from "@/types/Review";
import {
  CreateReviewPayload,
  GetAllReviewByCompanyIdResult,
  GetAverageRatingByCompanyIdResult,
  GetRatingDistributionByCompanyIdResult,
  ReviewApiError,
  GetAllReviewByCompanyIdControllerParams,
} from "../types";
import {
  createReviewService,
  getReviewsByCompanyService,
  getAllReviewByCompanyIdService,
  getAverageRatingByCompanyIdService,
  getRatingDistributionByCompanyIdService,
} from "../service/review.service";
import { isValidUuid } from "@/features/shift/utils/shift.utils";
import { validateCreateReviewPayload } from "../validator/review.validator";

const validateCompanyId = (company_id: string) => {
  if (!company_id || !isValidUuid(company_id)) {
    throw new ReviewApiError("Company ID không hợp lệ.", 400);
  }
};

export async function handleCreateReview(
  payload: CreateReviewPayload,
): Promise<Review> {
  validateCreateReviewPayload(payload);
  try {
    const review = await createReviewService(payload);
    return review;
  } catch (error) {
    console.error("Error in handleCreateReview:", error);
    throw error; // Re-throw to be handled by the route layer
  }
}

export async function handleGetReviewsByCompany(
  companyId: string,
): Promise<Review[]> {
  const reviews = await getReviewsByCompanyService(companyId);
  return reviews;
}

export const handleGetAllReviewByCompanyId = async ({
  company_id,
  page,
  page_size,
}: GetAllReviewByCompanyIdControllerParams): Promise<GetAllReviewByCompanyIdResult> => {
  validateCompanyId(company_id);

  if (!Number.isInteger(page) || page < 1) {
    throw new ReviewApiError("Trang không hợp lệ.", 400);
  }

  return getAllReviewByCompanyIdService({
    company_id,
    page,
    page_size,
  });
};

export const handleGetAverageRatingByCompanyId = async (
  company_id: string,
): Promise<GetAverageRatingByCompanyIdResult> => {
  validateCompanyId(company_id);

  const result = await getAverageRatingByCompanyIdService(company_id);

  if (!result) {
    throw new ReviewApiError("Không tìm thấy công ty.", 404);
  }

  return result;
};

export const handleGetRatingDistributionByCompanyId = async (
  company_id: string,
): Promise<GetRatingDistributionByCompanyIdResult> => {
  validateCompanyId(company_id);

  return getRatingDistributionByCompanyIdService(company_id);
};
