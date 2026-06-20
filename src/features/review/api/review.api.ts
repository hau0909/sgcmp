import { fetcher } from '@/lib/fetcher';
import { CreateReviewPayload, CreateReviewResponse } from '../types';
import { Review } from '@/types/Review';

export async function requestCreateReview(payload: CreateReviewPayload): Promise<CreateReviewResponse> {
  return (await fetcher('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as CreateReviewResponse;
}

export async function requestGetReviewsByCompany(companyId: string): Promise<{ reviews: Review[] }> {
  return (await fetcher(`/api/reviews/company?companyId=${companyId}`, {
    method: 'GET',
  })) as { reviews: Review[] };
}

