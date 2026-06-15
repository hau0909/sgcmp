
export type ActivityType = "Chi nhánh" | "Kho bãi" | "Showroom" | "Văn phòng" | "Trung tâm điều phối";
export interface CompanyComponent {
  id: string;
  name: string;
  activityType: ActivityType;
  address: string;
  personInCharge: string;
  photos: string[]; // 2 photos of component
}

export interface BusinessLicenseData {
  registrationNumber: string;
  issueDate: string;
  issuePlace: string;
  representativeName: string;
  representativeId: string;
  representativePosition: string;
  licenseFileName: string | null;
  idFrontCardFileName: string | null; // CCCD front
  idBackCardFileName: string | null;  // CCCD back
}

export interface OnboardingData {
  components: CompanyComponent[];
  businessLicense: BusinessLicenseData;
}

export const ONBOARDING_STORAGE_KEY = "sgcmp-onboarding-data";

export const DEFAULT_BUSINESS_LICENSE: BusinessLicenseData = {
  registrationNumber: "",
  issueDate: "",
  issuePlace: "",
  representativeName: "",
  representativeId: "",
  representativePosition: "",
  licenseFileName: null,
  idFrontCardFileName: null,
  idBackCardFileName: null,
};

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  "Chi nhánh": "bg-[#dbeafe] text-[#1d4ed8]",
  "Kho bãi": "bg-[#ffedd5] text-[#c2410c]",
  Showroom: "bg-[#ede9fe] text-[#6d28d9]",
  "Văn phòng": "bg-[#dcfce7] text-[#166534]",
  "Trung tâm điều phối": "bg-[#fce7f3] text-[#be185d]",
};

export const ISSUE_PLACES = [
  "Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh",
  "Sở Kế hoạch và Đầu tư Hà Nội",
  "Sở Kế hoạch và Đầu tư Đà Nẵng",
  "Sở Kế hoạch và Đầu tư Cần Thơ",
  "Sở Kế hoạch và Đầu tư Bình Dương",
  "Sở Kế hoạch và Đầu tư Đồng Nai",
];
