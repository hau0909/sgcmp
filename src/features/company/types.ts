export interface MarketplaceCompany {
  id: string;
  name: string;
  logoUrl?: string;
  initials: string;
  rating: number | null; // Use null for "Mới" (New)
  location: string;
  tags: string[];
  pricePerHour: number;
  description?: string;
}
