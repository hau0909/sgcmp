import type { BookingStatus, QuotationType } from "./Enum";
import type { Service } from "./Service";
export type { BookingStatus, QuotationType };

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
  quotation_type?: QuotationType | null;
  hourly_rate?: number | null;
  monthly_rate?: number | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;

  // DB Columns
  company_name?: string | null;
  company_scope?: string | null;
  company_position?: string | null;


  // Virtual & joined relation fields for UI rendering
  customer_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  service_name?: string;
  service_price?: number | null;
  contract_id?: string | null;
  contract_status?: string | null;
  company_contact_person?: string;
  company_phone?: string;
  company_email?: string;
  company_address?: string;
  client_company_name?: string | null;
  monthly_discount_percent?: number | null;
  package_discount_percent?: number | null;
  services?: Partial<Service> | { name: string | null } | { name: string | null }[] | null;
}

