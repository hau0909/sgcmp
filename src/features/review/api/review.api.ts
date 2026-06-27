import { fetcher } from "@/lib/fetcher";
import {
  CreateReviewPayload,
  CreateReviewResponse,
  RequestGetAllReviewByCompanyIdParams,
  GetAllReviewByCompanyIdResponse,
  GetAverageRatingByCompanyIdResponse,
  GetRatingDistributionByCompanyIdResponse,
} from "../types";
import { Review } from "@/types/Review";

export async function requestCreateReview(
  payload: CreateReviewPayload,
): Promise<CreateReviewResponse> {
  return (await fetcher("/api/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as CreateReviewResponse;
}

export async function requestGetReviewsByCompany(
  companyId: string,
): Promise<{ reviews: Review[] }> {
  return (await fetcher(`/api/reviews/company?companyId=${companyId}`, {
    method: "GET",
  })) as { reviews: Review[] };
}

export const requestGetAllReviewByCompanyId = async ({
  companyId,
  page = 1,
}: RequestGetAllReviewByCompanyIdParams): Promise<GetAllReviewByCompanyIdResponse> => {
  const searchParams = new URLSearchParams({
    page: String(page),
  });

  return fetcher(
    `/api/reviews/company/${companyId}?${searchParams.toString()}`,
    {
      method: "GET",
    },
  );
};

export const requestGetAverageRatingByCompanyId = async (
  companyId: string,
): Promise<GetAverageRatingByCompanyIdResponse> => {
  return fetcher(`/api/reviews/company/${companyId}/average-rating`, {
    method: "GET",
  });
};

export const requestGetRatingDistributionByCompanyId = async (
  companyId: string,
): Promise<GetRatingDistributionByCompanyIdResponse> => {
  return fetcher(`/api/reviews/company/${companyId}/rating-distribution`, {
    method: "GET",
  });
};
