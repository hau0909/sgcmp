export interface Review {
  review_id: string;
  contract_id: string;
  customer_id: string;
  company_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at: string;
}
