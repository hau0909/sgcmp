import { Review } from "@/types/Review";

export type CreateReviewPayload = Omit<
  Review,
  "review_id" | "created_at" | "updated_at"
>;

export interface CreateReviewResponse {
  message: string;
  review: Review;
}

export type ReviewCustomer = {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
};

export type CompanyReviewItem = {
  review_id: string;
  contract_id: string;
  customer_id: string;
  company_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string | null;
  customer: ReviewCustomer | null;
};

export type ReviewPagination = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
};

export type RatingDistributionItem = {
  star: 1 | 2 | 3 | 4 | 5;
  count: number;
  percent: number;
};

export type GetAllReviewByCompanyIdResult = {
  reviews: CompanyReviewItem[];
  pagination: ReviewPagination;
};

export type GetRatingDistributionByCompanyIdResult = {
  total_reviews: number;
  rating_distribution: RatingDistributionItem[];
};

export type GetAllReviewByCompanyIdParams = {
  company_id: string;
  page: number;
  page_size: number;
};

export class ReviewApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export type GetAverageRatingByCompanyIdResult = {
  average_rating: number;
};

export type ReviewRow = {
  review_id: string;
  contract_id: string;
  customer_id: string;
  company_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string | null;
};

export type GetAllReviewByCompanyIdControllerParams = {
  company_id: string;
  page: number;
  page_size: number;
};

export type RequestGetAllReviewByCompanyIdParams = {
  companyId: string;
  page?: number;
};

export type GetAllReviewByCompanyIdResponse = {
  message: string;
  data: GetAllReviewByCompanyIdResult;
};

export type GetAverageRatingByCompanyIdResponse = {
  message: string;
  data: GetAverageRatingByCompanyIdResult;
};

export type GetRatingDistributionByCompanyIdResponse = {
  message: string;
  data: GetRatingDistributionByCompanyIdResult;
};
