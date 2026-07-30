import { BookingStatus } from "./Enum";

export interface Booking {
  booking_id: string;
  customer_id: string;
  company_id: string;
  service_id: string;
  address: string;
  description?: string | null;
  guards_per_slot: number;
  time_slots: string[];
  day_per_week: string[];
  start_date: string;
  end_date: string;
  quoted_price: number | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;

  // DB Columns
  company_name?: string | null;
  company_scope?: string | null;
  company_position?: string | null;
  quotation_type?: string | null;
  hourly_rate?: number | null;
  monthly_rate?: number | null;

  // Virtual fields for UI rendering
  customer_name?: string;
  company_contact_person?: string;
  service_name?: string;
  contract_status?: string;
}

