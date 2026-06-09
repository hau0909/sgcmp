export type ContractStatus = "pending_hardcopy" | "pending_consent" | "completed";

export interface Contract {
  id: string;
  contractCode: string;
  customerName: string;
  serviceName: string;
  createdAt: string; // ISO format or string
  status: ContractStatus;
}
