import { fetcher } from '@/lib/fetcher';
import { CreateReviewPayload, CreateReviewResponse } from '../types';

export async function requestCreateReview(payload: CreateReviewPayload): Promise<CreateReviewResponse> {
  return (await fetcher('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as CreateReviewResponse;
}
