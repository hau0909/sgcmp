import { Booking } from "@/types/Booking";

export * from "@/types/Booking";
export * from "@/types/Enum";

export interface BookingWithCustomerProfile extends Booking {
  profiles: {
    full_name: string | null;
  } | {
    full_name: string | null;
  }[] | null;
  services: {
    name: string | null;
  } | {
    name: string | null;
  }[] | null;
}

export interface CreateBookingRequest {
  customer_id: string;
  company_id: string;
  service_id: string;
  address: string;
  description?: string | null;
  guards_per_slot: number;
  time_slots: string[];
  start_date: string;
  end_date: string;
}

export interface UpdateQuotationRequest {
  quoted_price: number;
}

export interface UpdateBookingStatusRequest {
  status: "accepted" | "rejected";
}
