export interface Service {
  service_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
};