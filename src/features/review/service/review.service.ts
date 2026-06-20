import { Review } from '@/types/Review';
import { CreateReviewPayload } from '../types';
import { insertReview, hasExistingReview, getReviewsByCompany } from '../repository/review.repository';

export async function createReviewService(payload: CreateReviewPayload): Promise<Review> {
  if (!payload.contract_id || !payload.customer_id || !payload.company_id) {
    throw new Error('Missing required fields (contract_id, customer_id, company_id)');
  }

  if (payload.rating < 1 || payload.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const exists = await hasExistingReview(payload.contract_id);
  if (exists) {
    throw new Error('Hợp đồng này đã được đánh giá. Bạn không thể đánh giá lại.');
  }

  const review = await insertReview(payload);
  return review;
}

export async function getReviewsByCompanyService(companyId: string): Promise<Review[]> {
  if (!companyId) {
    throw new Error('companyId is required');
  }

  const reviews = await getReviewsByCompany(companyId);
  return reviews;
}

