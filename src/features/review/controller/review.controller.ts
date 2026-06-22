import { Review } from '@/types/Review';
import { CreateReviewPayload } from '../types';
import { createReviewService, getReviewsByCompanyService } from '../service/review.service';

export async function handleCreateReview(payload: CreateReviewPayload): Promise<Review> {
  try {
    const review = await createReviewService(payload);
    return review;
  } catch (error) {
    console.error('Error in handleCreateReview:', error);
    throw error; // Re-throw to be handled by the route layer
  }
}

export async function handleGetReviewsByCompany(companyId: string): Promise<Review[]> {
  const reviews = await getReviewsByCompanyService(companyId);
  return reviews;
}

