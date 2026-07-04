export interface Registration {
  registration_id: string;
  registration_code: string;
  company_id: string | null;
  status: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

