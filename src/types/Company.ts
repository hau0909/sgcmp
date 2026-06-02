import { GeneralStatus } from "./Enum";

export interface Company {
  companyId: string;
  ownerId: string;
  companyName: string;
  businessLicenseNo: string;
  licenseFileUrl: string | null;
  address: string;
  description: string | null;
  ratingAverage: number | null;
  status: GeneralStatus;
  createdAt: Date;
}
