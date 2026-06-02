export interface Plan {
  planId: string;
  planName: string;
  description: string | null;
  price: number;
  durationDays: number;
  maxCoordinators: number | null;
  maxGuards: number | null;
  features: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
