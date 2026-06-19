export type UserRole =
  | "customer"
  | "admin"
  | "company-admin"
  | "guard"
  | "Coordinator";

export type GeneralStatus = "active" | "unactive";

export type PaymentMethod = "bank_transfer" | "credit_card" | "e_wallet";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type ContractStatus = "pending_signatures" | "active" | "completed" | "cancelled";

export type BookingStatus = "pending" | "quoted" | "accepted" | "rejected";

export type ImageType = 'logo' | 'banner' | 'other';
