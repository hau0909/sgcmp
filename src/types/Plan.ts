export interface Plan {
  plan_id: number;
  plan_name: string;
  description: string | null;
  price: number;
  duration_days: number;
  max_coordinators: number | null;
  max_guards: number | null;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}
