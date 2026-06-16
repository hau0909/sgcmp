import { createClient } from '@/lib/supabase/server';
import { Review } from '@/types/Review';
import { CreateReviewPayload } from '../types';

export async function insertReview(payload: CreateReviewPayload): Promise<Review> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .insert([payload])
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Failed to insert review, no data returned');
  }

  return data as Review;
}

export async function hasExistingReview(contract_id: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('review_id')
    .eq('contract_id', contract_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
}
