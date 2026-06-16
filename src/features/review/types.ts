import { Review } from '@/types/Review';

export type CreateReviewPayload = Omit<Review, 'review_id' | 'created_at' | 'updated_at'>;

export interface CreateReviewResponse {
  message: string;
  review: Review;
}
