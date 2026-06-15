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
