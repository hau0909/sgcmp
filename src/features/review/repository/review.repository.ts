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

  // Cập nhật rating_average của company sau khi thêm đánh giá
  try {
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('company_id', payload.company_id);

    if (!ratingsError && ratingsData && ratingsData.length > 0) {
      const avgRating = ratingsData.reduce((acc, curr) => acc + curr.rating, 0) / ratingsData.length;
      
      await supabase
        .from('companies')
        .update({ rating_average: Number(avgRating.toFixed(1)) })
        .eq('company_id', payload.company_id);
    }
  } catch (err) {
    console.error('Failed to update company average rating:', err);
    // Vẫn return review ngay cả khi update rating fail
  }

  return data as Review;
}

export async function getReviewsByCompany(companyId: string): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as Review[]) || [];
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
