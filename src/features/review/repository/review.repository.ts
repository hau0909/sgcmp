import { createClient } from "@/lib/supabase/server";
import { Review } from "@/types/Review";
import {
  CreateReviewPayload,
  CompanyReviewItem,
  GetAllReviewByCompanyIdParams,
  GetAllReviewByCompanyIdResult,
  ReviewCustomer,
  ReviewRow,
  GetAverageRatingByCompanyIdResult,
  GetRatingDistributionByCompanyIdResult,
} from "../types";

export async function insertReview(
  payload: CreateReviewPayload,
): Promise<Review> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to insert review, no data returned");
  }

  // Cập nhật rating_average của company sau khi thêm đánh giá
  try {
    const { data: ratingsData, error: ratingsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("company_id", payload.company_id);

    if (!ratingsError && ratingsData && ratingsData.length > 0) {
      const avgRating =
        ratingsData.reduce((acc, curr) => acc + curr.rating, 0) /
        ratingsData.length;

      await supabase
        .from("companies")
        .update({ rating_average: Number(avgRating.toFixed(1)) })
        .eq("company_id", payload.company_id);
    }
  } catch (err) {
    console.error("Failed to update company average rating:", err);
    // Vẫn return review ngay cả khi update rating fail
  }

  return data as Review;
}

export async function getReviewsByCompany(
  companyId: string,
): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(full_name, avatar_url)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as Review[]) || [];
}

export async function hasExistingReview(contract_id: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("review_id")
    .eq("contract_id", contract_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
}

export const getAllReviewByCompanyId = async ({
  company_id,
  page,
  page_size,
}: GetAllReviewByCompanyIdParams): Promise<GetAllReviewByCompanyIdResult> => {
  const supabase = await createClient();

  const from = (page - 1) * page_size;
  const to = from + page_size - 1;

  const {
    data: reviewData,
    error: reviewError,
    count,
  } = await supabase
    .from("reviews")
    .select(
      `
        review_id,
        contract_id,
        customer_id,
        company_id,
        rating,
        comment,
        created_at,
        updated_at
      `,
      { count: "exact" },
    )
    .eq("company_id", company_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  const reviewsRaw = (reviewData ?? []) as ReviewRow[];
  const customerIds = reviewsRaw.map((review) => review.customer_id);

  let customerMap = new Map<string, ReviewCustomer>();

  if (customerIds.length > 0) {
    const { data: customerData, error: customerError } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, avatar_url")
      .in("user_id", customerIds);

    if (customerError) {
      throw new Error(customerError.message);
    }

    customerMap = new Map(
      (customerData ?? []).map((customer) => [
        customer.user_id,
        customer as ReviewCustomer,
      ]),
    );
  }

  const reviews: CompanyReviewItem[] = reviewsRaw.map((review) => ({
    ...review,
    customer: customerMap.get(review.customer_id) ?? null,
  }));

  const total_items = count ?? 0;
  const total_pages = Math.ceil(total_items / page_size);

  return {
    reviews,
    pagination: {
      page,
      page_size,
      total_items,
      total_pages,
      has_next_page: page < total_pages,
      has_previous_page: page > 1,
    },
  };
};

export const getAverageRatingByCompanyId = async (
  company_id: string,
): Promise<GetAverageRatingByCompanyIdResult | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("rating_average")
    .eq("company_id", company_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    average_rating: Number(data.rating_average ?? 0),
  };
};

export const getRatingDistributionByCompanyId = async (
  company_id: string,
): Promise<GetRatingDistributionByCompanyIdResult> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("company_id", company_id);

  if (error) {
    throw new Error(error.message);
  }

  const ratings = data ?? [];
  const total_reviews = ratings.length;

  const getStarCount = (star: 1 | 2 | 3 | 4 | 5) => {
    return ratings.filter((item) => {
      const rating = Number(item.rating);

      if (star === 5) {
        return rating === 5;
      }

      return rating >= star && rating < star + 1;
    }).length;
  };

  const rating_distribution = ([5, 4, 3, 2, 1] as const).map((star) => {
    const count = getStarCount(star);

    return {
      star,
      count,
      percent:
        total_reviews === 0 ? 0 : Math.round((count / total_reviews) * 100),
    };
  });

  return {
    total_reviews,
    rating_distribution,
  };
};
