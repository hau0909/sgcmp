import type { ContractOption, GuardOption } from "../type";

export const mockContractOptions: ContractOption[] = [
  {
    contract_id: "contract-1",
    code: "HD-001",
    customer_name: "Nguyễn Văn Minh",
    company_name: "SGCMP Security",
    service_name: "Bảo vệ tòa nhà",
    address: "Tòa nhà Alpha",
    start_date: "2026-06-01",
    end_date: "2026-06-30",
  },
  {
    contract_id: "contract-2",
    code: "HD-002",
    customer_name: "Trần Thị Lan",
    company_name: "SGCMP Security",
    service_name: "Bảo vệ nhà máy",
    address: "Nhà máy Beta",
    start_date: "2026-06-05",
    end_date: "2026-07-05",
  },
  {
    contract_id: "contract-3",
    code: "HD-003",
    customer_name: "Lê Hoàng Nam",
    company_name: "SGCMP Security",
    service_name: "Bảo vệ văn phòng",
    address: "Văn phòng Giga",
    start_date: "2026-06-10",
    end_date: "2026-07-10",
  },
];

export const mockGuardOptions: GuardOption[] = [
  {
    guard_id: "guard-1",
    guard_code: "GD-4921",
    full_name: "N.V. Hùng",
    phone_number: "0901234567",
    email: "hung@example.com",
    status: "active",
  },
  {
    guard_id: "guard-2",
    guard_code: "GD-8120",
    full_name: "T.Đ. Trung",
    phone_number: "0912345678",
    email: "trung@example.com",
    status: "active",
  },
  {
    guard_id: "guard-3",
    guard_code: "GD-3340",
    full_name: "L.H. Nam",
    phone_number: "0923456789",
    email: "nam@example.com",
    status: "active",
  },
  {
    guard_id: "guard-4",
    guard_code: "GD-9982",
    full_name: "T.V. An",
    phone_number: "0934567890",
    email: "an@example.com",
    status: "active",
  },
  {
    guard_id: "guard-5",
    guard_code: "GD-2210",
    full_name: "Đ.T. Mai",
    phone_number: "0945678901",
    email: "mai@example.com",
    status: "unactive",
  },
];
