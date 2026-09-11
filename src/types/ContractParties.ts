export interface ContractParties {
  contract_id: string;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_address?: string | null;
  customer_company_name?: string | null;
  customer_company_scope?: string | null;
  customer_position?: string | null;
  customer_signed_at?: string | null;
  company_name: string;
  business_license_no?: string | null;
  company_address?: string | null;
  company_phone?: string | null;
  company_email?: string | null;
  representative_name?: string | null;
  company_signed_at?: string | null;
  created_at?: string;
}
