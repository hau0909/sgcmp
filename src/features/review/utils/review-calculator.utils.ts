import type {
  GetRatingDistributionByCompanyIdResult,
  RatingDistributionItem,
  ReviewRatingRow,
} from "../types";

/**
 * Thuật toán phân tích phổ điểm đánh giá (Star Rating Breakdown)
 * Gom nhóm các điểm số thành 5 mức sao và tính % tỷ trọng
 * @param ratings Mảng các bản ghi điểm đánh giá từ DB
 */
export function calculateRatingDistribution(
  ratings: ReviewRatingRow[] | null | undefined
): GetRatingDistributionByCompanyIdResult {
  const items = ratings || [];
  const total_reviews = items.length;

  const getStarCount = (star: 1 | 2 | 3 | 4 | 5) => {
    return items.filter((item) => {
      const rating = Number(item.rating);

      if (star === 5) {
        return rating === 5;
      }

      return rating >= star && rating < star + 1;
    }).length;
  };

  const rating_distribution: RatingDistributionItem[] = ([5, 4, 3, 2, 1] as const).map((star) => {
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
}
