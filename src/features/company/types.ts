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

export interface GetCompaniesRequestParams {
  page?: number;
  limit?: number;
}

export interface GetCompanyFiltersRequestParams {
  search?: string;
  location?: string;
  tags?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface GetCompaniesResponse {
  companies: MarketplaceCompany[];
  totalCount: number;
  totalPages: number;
}

export interface City {
  city_id: number;
  city_name: string;
}

export interface Ward {
  ward_id: number;
  ward_name: string;
  city_id: number;
}

export interface Service {
  service_id: string;
  name: string;
  description: string;
}

export interface GetCompanyFiltersResponse {
  cities: City[];
  wards: Ward[];
  services: Service[];
  companies?: MarketplaceCompany[];
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface CompanyServiceData {
  name: string;
  description: string;
  baseDescription: string;
  price: number;
}

export interface CompanyDetailData {
  id: string;
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  services: CompanyServiceData[];
}

