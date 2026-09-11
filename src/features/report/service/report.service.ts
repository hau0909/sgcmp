import { Report, ReportGuard, ReportStatus, ReportType } from "../types";
import {
  getCustomerReports,
  createCustomerReport,
  deleteCustomerReport,
  getCustomerContractsForReport,
  getCompanyReports,
  updateReportStatus,
} from "../repository/report.repository";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatReport = (item: any): Report => {
  const contract = item.contracts;
  const booking = contract?.bookings;
  const service = booking?.services;
  const serviceName = service?.name || "Dịch vụ bảo vệ";
  const shift = item.shifts;
  const rawAssignments = Array.isArray(shift?.shift_assignments)
    ? shift.shift_assignments
    : [];

  const guards: ReportGuard[] = rawAssignments.map((sa: any) => {
    const guardRel = Array.isArray(sa.guards) ? sa.guards[0] : sa.guards;
    const profile = guardRel?.profiles
      ? (Array.isArray(guardRel.profiles) ? guardRel.profiles[0] : guardRel.profiles)
      : (Array.isArray(sa.profiles) ? sa.profiles[0] : sa.profiles);
    return {
      guard_id: sa.guard_id,
      guard_name: profile?.full_name || "Chưa cập nhật",
      phone_number: profile?.phone_number || null,
      avatar_url: profile?.avatar_url || null,
      status: sa.status || null,
      check_in_time: sa.check_in_time || null,
    };
  });

  return {
    id: item.id,
    contract_id: item.contract_id,
    customer_id: item.customer_id,
    shift_id: item.shift_id || null,
    type: item.type as ReportType,
    description: item.description || "",
    status: item.status as ReportStatus,
    created_at: item.created_at,
    image_url: item.image_url || null,
    contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
    service_name: serviceName,
    report_code: `BC-${item.id.slice(0, 8).toUpperCase()}`,
    customer_name: item.customer_name,
    customer_phone: item.customer_phone,
    shift_name: shift?.shift_name || null,
    shift_start_time: shift?.start_time || null,
    shift_end_time: shift?.end_time || null,
    guards,
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
  shift_id?: string | null;
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

export const getCompanyReportsService = async (
  companyId: string,
  page: number,
  limit: number,
  search?: string,
  status?: ReportStatus,
  type?: ReportType
): Promise<{ reports: Report[]; totalCount: number }> => {
  const { data, count } = await getCompanyReports(
    companyId,
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

export const updateReportStatusService = async (
  id: string,
  status: ReportStatus
): Promise<Report> => {
  const rawReport = await updateReportStatus(id, status);
  // Need to enrich or just return basic report
  return formatReport(rawReport);
};

