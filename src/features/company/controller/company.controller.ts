import { getCompanyByOwnerIdService } from "./../../guards/service/guard.service";
import {
  CompanyFilterParams,
  PaginatedCompaniesResponse,
  getCompaniesService,
  CompanyFiltersDataResponse,
  getCompanyFiltersService,
  getCompanyByIdServiceInCustomer,
  updateCompanyProfileService,
  uploadCompanyImageService,
  getCompanyActivityImagesService,
} from "../service/company.service";
import {
  CompanyDetailData,
  UpdateCompanyProfileControllerParams,
  UpdateCompanyProfileInput,
  UploadCompanyImageControllerParams,
} from "../types";
import {
  validateUpdateCompanyProfileInput,
  validateUploadCompanyImageInput,
} from "../validator/company.validate";
import { getCurrentUserProfileService } from "@/features/auth/service/auth.service";
import { ImageType } from "@/types/Enum";

export const handleGetCompanies = async (
  params: CompanyFilterParams,
): Promise<PaginatedCompaniesResponse> => {
  const result = await getCompaniesService(params);
  return result;
};

export const handleGetCompanyFilters = async (
  params?: CompanyFilterParams,
): Promise<CompanyFiltersDataResponse> => {
  const result = await getCompanyFiltersService(params);
  return result;
};

export const handleGetCompanyById = async (
  id: string,
): Promise<CompanyDetailData | null> => {
  const result = await getCompanyByIdServiceInCustomer(id);
  return result;
};

export const handleUpdateCompanyProfile = async ({
  input,
}: UpdateCompanyProfileControllerParams) => {
  validateUpdateCompanyProfileInput(input);

  const profile = await getCurrentUserProfileService();

  if (!profile) {
    return {
      success: false,
      message: "Bạn chưa đăng nhập",
      data: null,
    };
  }

  const company_id = await getCompanyByOwnerIdService(profile.user_id);

  const cleanedInput: UpdateCompanyProfileInput = {
    company_name: input.company_name.trim(),
    description: input.description.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    business_license_no: input.business_license_no.trim(),
    registration_code: input.registration_code.trim(),
  };

  const data = await updateCompanyProfileService({
    company_id,
    input: cleanedInput,
  });

  return data;
};

export const handleUploadCompanyImage = async ({
  file,
  image_type,
}: UploadCompanyImageControllerParams) => {
  validateUploadCompanyImageInput({
    file,
    image_type,
  });

  const profile = await getCurrentUserProfileService();

  if (!profile) {
    return {
      success: false,
      message: "Bạn chưa đăng nhập",
      data: null,
    };
  }

  const company_id = await getCompanyByOwnerIdService(profile.user_id);

  const data = await uploadCompanyImageService({
    company_id,
    file: file as File,
    image_type: image_type as ImageType,
  });

  return data;
};

export const handleGetCompanyActivityImages = async () => {
  const profile = await getCurrentUserProfileService();

  if (!profile) {
    return {
      success: false,
      message: "Bạn chưa đăng nhập",
      data: null,
    };
  }

  const company_id = await getCompanyByOwnerIdService(profile.user_id);

  const data = await getCompanyActivityImagesService(company_id);

  return data;
};
