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
  getCompanyPublishRequestById,
  updateCompanyPublishRequestStatus,
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
  PublishRequestDetailData,
} from "../types";
import { getProfileByUserId } from "@/features/profile/repository/profile.repository";
import { Company } from "@/types/Company";
import { CompanyStatus } from "@/types/Enum";

export interface CompanyFilterParams {
  search?: string;
  location?: string;
  tags?: string[];
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
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

  // Find minimum and maximum price among services, default to 0 if none
  let pricePerHour = 0;
  let maxPrice = 0;
  const serviceCount = dbCompany.company_services ? dbCompany.company_services.length : 0;
  if (dbCompany.company_services && dbCompany.company_services.length > 0) {
    const prices = dbCompany.company_services
      .map((cs) => cs.price)
      .filter((p) => typeof p === "number");
    if (prices.length > 0) {
      pricePerHour = Math.min(...prices);
      maxPrice = Math.max(...prices);
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

  const logoImg = dbCompany.company_imgs?.find(
    (img) => img.image_type === "logo",
  );

  return {
    id: dbCompany.company_id,
    name: dbCompany.company_name,
    logoUrl: logoImg ? logoImg.image_url : undefined,
    initials,
    rating: dbCompany.rating_average,
    location,
    tags,
    pricePerHour,
    maxPrice,
    serviceCount,
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

  // 4. Tags filter — OR logic: show company if it has ANY of the selected tags
  if (params.tags && params.tags.length > 0) {
    companies = companies.filter((c) =>
      params.tags!.some((selectedTag) =>
        c.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()),
      ),
    );
  }

  // 4.5. Price range filter
  if (params.minPrice !== undefined) {
    companies = companies.filter((c) => c.pricePerHour >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    companies = companies.filter((c) => c.pricePerHour > 0 && c.pricePerHour <= params.maxPrice!);
  }

  // 5. Sort operations
  const sortBy = params.sortBy || "Đề xuất";
  if (sortBy === "Đánh giá cao nhất") {
    companies.sort((a, b) => {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      return ratingB - ratingA;
    });
  } else if (sortBy === "Đánh giá thấp nhất") {
    companies.sort((a, b) => {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      return ratingA - ratingB;
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

  return {
    company,
    registration: null,
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
  requestedBy: string,
  note?: string,
): Promise<{ request_id: string }> => {
  return await createCompanyPublishRequest(companyId, requestedBy, note);
};

export const getCompanyPublishRequestsService = async (): Promise<CompanyPublishRequestItem[]> => {
  return await getCompanyPublishRequests();
};

export const getCompanyPublishRequestByIdService = async (
  requestId: string,
): Promise<PublishRequestDetailData | null> => {
  const publishRequest = await getCompanyPublishRequestById(requestId);
  if (!publishRequest) return null;

  const companyDetails = await getCompanyByIdServiceInCustomer(publishRequest.company_id);
  if (!companyDetails) return null;

  let requesterInfo: any = undefined;
  if (publishRequest.requested_by) {
    try {
      const profile = await getProfileByUserId(publishRequest.requested_by);
      if (profile) {
        requesterInfo = {
          full_name: profile.full_name,
          role: profile.role,
          phone: profile.phone_number || "",
          email: profile.email,
        };
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin người gửi yêu cầu:", err);
    }
  }

  return {
    request_id: publishRequest.request_id,
    company_id: publishRequest.company_id,
    status: publishRequest.status.toLowerCase(),
    note: publishRequest.notes,
    requested_at: publishRequest.requested_at,
    requested_by: requesterInfo,
    company: {
      company_name: companyDetails.name,
      description: companyDetails.description,
      logo_url: companyDetails.logoUrl,
      banner_url: companyDetails.bannerUrl,
      email: companyDetails.email,
      phone: companyDetails.phone,
      address: companyDetails.address,
      business_license_no: companyDetails.companyLicenseNo || companyDetails.businessLicenseNo || "",
      registration_code: companyDetails.businessLicenseNo || "",
      license_file_url: companyDetails.licenseFileUrl,
      activity_images: companyDetails.activityImgs || [],
      services: companyDetails.services.map((s) => ({
        service_id: s.serviceId,
        name: s.name,
        sub_description: s.description || undefined,
        description: s.baseDescription || "",
        price: s.price,
      })),
    },
  };
};

export const updateCompanyPublishRequestStatusService = async (
  requestId: string,
  status: "APPROVED" | "REJECTED",
  approvedBy?: string,
): Promise<void> => {
  await updateCompanyPublishRequestStatus(requestId, status, approvedBy);
};
