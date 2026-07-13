import { Report, ReportStatus, ReportType } from "../types";
import {
  getCustomerReportsService,
  createCustomerReportService,
  deleteCustomerReportService,
  getCustomerContractsForReportService,
} from "../service/report.service";

export const handleGetCustomerContractsForReport = async (
  customerId: string
): Promise<any[]> => {
  return await getCustomerContractsForReportService(customerId);
};

export const handleGetCustomerReports = async (
  customerId: string,
  params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    type?: string;
  }
): Promise<{ reports: Report[]; totalCount: number }> => {
  const validStatus = (params.status && params.status !== "ALL")
    ? (params.status as ReportStatus)
    : undefined;

  const validType = (params.type && params.type !== "ALL")
    ? (params.type as ReportType)
    : undefined;

  return await getCustomerReportsService(
    customerId,
    params.page,
    params.limit,
    params.search,
    validStatus,
    validType
  );
};

export const handleCreateCustomerReport = async (payload: {
  contract_id: string;
  customer_id: string;
  type: ReportType;
  description: string;
  image_url?: string | null;
}): Promise<Report> => {
  if (!payload.contract_id) {
    throw new Error("Mã hợp đồng là bắt buộc");
  }
  if (!payload.type) {
    throw new Error("Vấn đề khiếu nại là bắt buộc");
  }
  if (!payload.description) {
    throw new Error("Mô tả chi tiết là bắt buộc");
  }

  return await createCustomerReportService(payload);
};

export const handleDeleteCustomerReport = async (
  id: string,
  customerId: string
): Promise<void> => {
  if (!id) {
    throw new Error("Mã báo cáo là bắt buộc");
  }
  await deleteCustomerReportService(id, customerId);
};
