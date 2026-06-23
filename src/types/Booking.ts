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

  // Virtual fields for UI rendering
  customer_name?: string;
  company_name?: string;
  service_name?: string;
}
