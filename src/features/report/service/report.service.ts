import { Report, ReportStatus, ReportType } from "../types";
import {
  getCustomerReports,
  createCustomerReport,
  deleteCustomerReport,
  getCustomerContractsForReport,
} from "../repository/report.repository";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatReport = (item: any): Report => {
  const contract = item.contracts;
  const booking = contract?.bookings;
  const service = booking?.services;
  const serviceName = service?.name || "Dịch vụ bảo vệ";

  return {
    id: item.id,
    contract_id: item.contract_id,
    customer_id: item.customer_id,
    type: item.type as ReportType,
    description: item.description || "",
    status: item.status as ReportStatus,
    created_at: item.created_at,
    image_url: item.image_url || null,
    contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
    service_name: serviceName,
    report_code: `BC-${item.id.slice(0, 8).toUpperCase()}`,
  };
};

export const getCustomerReportsService = async (
  customerId: string,
  page: number,
  limit: number,
  search?: string,
  status?: ReportStatus,
  type?: ReportType
): Promise<{ reports: Report[]; totalCount: number }> => {
  const { data, count } = await getCustomerReports(
    customerId,
    page,
    limit,
    search,
    status,
    type
  );

  const reports = data.map((item) => formatReport(item));

  return {
    reports,
    totalCount: count,
  };
};

export const createCustomerReportService = async (payload: {
  contract_id: string;
  customer_id: string;
  type: ReportType;
  description: string;
  image_url?: string | null;
}): Promise<Report> => {
  const rawReport = await createCustomerReport(payload);
  return formatReport(rawReport);
};

export const deleteCustomerReportService = async (
  id: string,
  customerId: string
): Promise<void> => {
  await deleteCustomerReport(id, customerId);
};

export const getCustomerContractsForReportService = async (
  customerId: string
): Promise<any[]> => {
  return await getCustomerContractsForReport(customerId);
};
