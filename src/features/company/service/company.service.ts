import {
  getAllActiveCompanies,
  DbCompany,
  getServices,
  getCompanyById,
  getCompanyByIdWithDetails,
  updateCompanyprofile,
  updateRegistrationCodeByCompanyId,
  uploadCompanyImage,
  getCompanyActivityImages,
  createCompanyPublishRequest,
  getCompanyPublishRequests,
} from "../repository/company.repository";
import {
  getCitiesService as getCities,
  getWardsService as getWards,
  formatAddressService,
} from "@/features/address";
import {
  MarketplaceCompany,
  City,
  Ward,
  Service,
  CompanyDetailData,
  CompanyServiceData,
  UpdateCompanyProfileInput,
  UploadCompanyImageServiceParams,
  CompanyPublishRequestItem,
} from "../types";
import { Company } from "@/types/Company";
import { CompanyStatus } from "@/types/Enum";

export interface CompanyFilterParams {
  search?: string;
  location?: string;
  tags?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCompaniesResponse {
  companies: MarketplaceCompany[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CompanyFiltersDataResponse {
  cities: City[];
  wards: Ward[];
  services: Service[];
  companies?: MarketplaceCompany[];
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim();
}

export const mapDbCompanyToMarketplace = async (
  dbCompany: DbCompany,
): Promise<MarketplaceCompany> => {
  const name = dbCompany.company_name;

  // Extract tags from services name
  const tags = dbCompany.company_services
    ? dbCompany.company_services
        .map((cs) => cs.services?.name)
        .filter((n): n is string => !!n)
    : [];

  // Find minimum price among services, default to 0 if none
  let pricePerHour = 0;
  if (dbCompany.company_services && dbCompany.company_services.length > 0) {
    const prices = dbCompany.company_services
      .map((cs) => cs.price)
      .filter((p) => typeof p === "number");
    if (prices.length > 0) {
      pricePerHour = Math.min(...prices);
    }
  }

  // Calculate initials from name
  const cleanName = name
    .replace(
      /^(Công ty|TNHH|Cổ phần|Dịch vụ|Bảo vệ|TNHH Dịch vụ Bảo vệ)\s+/gi,
      "",
    )
    .replace(/\s+(Cổ phần|TNHH)\s*/gi, "")
    .trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  let initials = "CO";
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    initials = words[0].substring(0, 2).toUpperCase();
  }

  const location = await formatAddressService(dbCompany.address);

  return {
    id: dbCompany.company_id,
    name: dbCompany.company_name,
    logoUrl: undefined,
    initials,
    rating: dbCompany.rating_average,
    location,
    tags,
    pricePerHour,
    description: dbCompany.description || undefined,
  };
};

export const getCompaniesService = async (
  params: CompanyFilterParams = {},
): Promise<PaginatedCompaniesResponse> => {
  const dbCompanies = await getAllActiveCompanies();

  // 1. Map to MarketplaceCompany schema
  let companies = await Promise.all(dbCompanies.map(mapDbCompanyToMarketplace));

  // 2. Search query filter (search by name, description or tags)
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    companies = companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        c.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  // 3. Location filter (comparing against cities and wards tables)
  if (params.location && params.location.trim()) {
    const loc = params.location.toLowerCase().trim();
    const normalizedLoc = normalizeText(loc);

    const [cities, wards] = await Promise.all([getCities(), getWards()]);

    const matchedLocations = new Set<string>();
    // Match cities
    cities.forEach((c) => {
      if (normalizeText(c.city_name).includes(normalizedLoc)) {
        matchedLocations.add(c.city_name.toLowerCase());
      }
    });

    // Match wards
    wards.forEach((w) => {
      if (normalizeText(w.ward_name).includes(normalizedLoc)) {
        matchedLocations.add(w.ward_name.toLowerCase());
        const parentCity = cities.find((c) => c.city_id === w.city_id);
        if (parentCity) {
          matchedLocations.add(parentCity.city_name.toLowerCase());
        }
      }
    });

    companies = companies.filter((c) => {
      const normAddr = normalizeText(c.location);
      if (normAddr.includes(normalizedLoc)) return true;
      for (const matchedLoc of matchedLocations) {
        if (normAddr.includes(normalizeText(matchedLoc))) {
          return true;
        }
      }
      return false;
    });
  }

  // 4. Tags filter
  if (params.tags && params.tags.length > 0) {
    companies = companies.filter((c) =>
      params.tags!.every((selectedTag) =>
        c.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()),
      ),
    );
  }

  // 5. Sort operations
  const sortBy = params.sortBy || "Đề xuất";
  if (sortBy === "Đánh giá cao nhất") {
    companies.sort((a, b) => {
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
      return b.rating - a.rating;
    });
  } else if (sortBy === "Giá thấp nhất") {
    companies.sort((a, b) => a.pricePerHour - b.pricePerHour);
  } else {
    // "Đề xuất" (Recommended - rating descending, then price ascending)
    companies.sort((a, b) => {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      return a.pricePerHour - b.pricePerHour;
    });
  }

  // 6. Pagination
  const totalCount = companies.length;
  const page = params.page || 1;
  const limit = params.limit || 6;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const startIndex = (page - 1) * limit;
  const paginatedCompanies = companies.slice(startIndex, startIndex + limit);

  return {
    companies: paginatedCompanies,
    totalCount,
    totalPages,
    currentPage: page,
  };
};

export const getCompanyFiltersService = async (
  params: CompanyFilterParams = {},
): Promise<CompanyFiltersDataResponse> => {
  const [cities, wards, services] = await Promise.all([
    getCities(),
    getWards(),
    getServices(),
  ]);

  const companiesResult = await getCompaniesService(params);

  return {
    cities,
    wards,
    services,
    companies: companiesResult.companies,
    totalCount: companiesResult.totalCount,
    totalPages: companiesResult.totalPages,
    currentPage: companiesResult.currentPage,
  };
};

export const getCompanyByIdServiceInCustomer = async (
  id: string,
): Promise<CompanyDetailData | null> => {
  const dbCompany = await getCompanyByIdWithDetails(id);
  if (!dbCompany) return null;

  const addressStr = await formatAddressService(dbCompany.address);
  const logoImg = dbCompany.company_imgs?.find(
    (img) => img.image_type === "logo",
  );
  const bannerImg = dbCompany.company_imgs?.find(
    (img) => img.image_type === "banner",
  );

  const services: CompanyServiceData[] = dbCompany.company_services
    ? dbCompany.company_services
        .map((cs) => {
          if (!cs.services) return null;
          return {
            serviceId: cs.services.service_id,
            name: cs.services.name,
            description: cs.description || "",
            baseDescription: cs.services.description || "",
            price: cs.price,
          };
        })
        .filter((s): s is CompanyServiceData => !!s)
    : [];

  const activityImgs = dbCompany.company_imgs
    ? dbCompany.company_imgs
        .filter(
          (img) => img.image_type !== "logo" && img.image_type !== "banner",
        )
        .map((img) => img.image_url)
    : [];

  const registrationCode =
    dbCompany.registrations && dbCompany.registrations.length > 0
      ? dbCompany.registrations[0].registration_code
      : dbCompany.business_license_no;

  return {
    id: dbCompany.company_id,
    name: dbCompany.company_name,
    logoUrl: logoImg ? logoImg.image_url : undefined,
    bannerUrl: bannerImg ? bannerImg.image_url : undefined,
    description: dbCompany.description || "",
    address: addressStr,
    phone: dbCompany.phone,
    email: dbCompany.email,
    services,
    businessLicenseNo: registrationCode,
    licenseFileUrl: dbCompany.license_file_url || undefined,
    status: dbCompany.status as CompanyStatus,
    createdAt: dbCompany.created_at,
    activityImgs,
    companyLicenseNo: dbCompany.business_license_no,
    ownerId: dbCompany.owner_id,
  };
};
export const getCompanyByIdService = async (
  companyId: string,
): Promise<Company | null> => {
  return await getCompanyById(companyId);
};

export const updateCompanyProfileService = async ({
  company_id,
  input,
}: {
  company_id: string;
  input: UpdateCompanyProfileInput;
}) => {
  const company = await updateCompanyprofile({ company_id, input });

  const registration = await updateRegistrationCodeByCompanyId({
    company_id,
    registration_code: input.registration_code,
  });

  return {
    company,
    registration,
  };
};

export const uploadCompanyImageService = async ({
  company_id,
  file,
  image_type,
}: UploadCompanyImageServiceParams) => {
  const image = await uploadCompanyImage({
    company_id,
    file,
    image_type,
  });

  return image;
};

export const getCompanyActivityImagesService = async (company_id: string) => {
  const images = await getCompanyActivityImages(company_id);

  return images;
};

export const createCompanyPublishRequestService = async (
  companyId: string,
  note?: string,
): Promise<any> => {
  return await createCompanyPublishRequest(companyId, note);
};

export const getCompanyPublishRequestsService = async (): Promise<CompanyPublishRequestItem[]> => {
  return await getCompanyPublishRequests();
};
