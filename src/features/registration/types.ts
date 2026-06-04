export interface CompanyRegistration {
  id: string;
  companyName: string;
  sector: string;
  businessType: string;
  submissionDate: string;
  status: "pending" | "action_required" | "approved";
  logoShort: string;
  errorDetail?: string;
}

export interface RegistrationStats {
  pendingCount: number;
  approvedMonthCount: number;
  averageTimeDays: string;
  errorCount: number;
}
