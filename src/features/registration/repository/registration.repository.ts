import { supabase } from "@/lib/supabase";
import { RegistrationWithCompany, RegistrationDetail } from "../types";

export const getRegistrations = async (): Promise<RegistrationWithCompany[]> => {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, companies(company_name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as RegistrationWithCompany[]) || [];
};

export const getRegistrationDetail = async (id: string): Promise<RegistrationDetail | null> => {
  const { data: regData, error: regError } = await supabase
    .from("registrations")
    .select("*, companies(*)")
    .eq("registration_id", id)
    .maybeSingle();

  if (regError) {
    throw regError;
  }

  if (!regData) {
    return null;
  }

  const registration = regData as any;
  const company = registration.companies;

  let profiles = null;
  if (company && company.owner_id) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", company.owner_id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }
    profiles = profileData;
  }

  return {
    ...registration,
    companies: company
      ? {
          ...company,
          profiles,
        }
      : null,
  } as RegistrationDetail;
};

export const updateRegistrationStatus = async (id: string, status: "approved" | "rejected"): Promise<void> => {
  const { data: regData, error: regError } = await supabase
    .from("registrations")
    .select("company_id")
    .eq("registration_id", id)
    .maybeSingle();

  if (regError) {
    throw regError;
  }

  if (!regData) {
    throw new Error("Không tìm thấy hồ sơ đăng ký");
  }

  const { error: updateRegError } = await supabase
    .from("registrations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("registration_id", id);

  if (updateRegError) {
    throw updateRegError;
  }

  if (regData.company_id) {
    const companyStatus = status === "approved" ? "active" : "unactive";
    const { error: updateCompanyError } = await supabase
      .from("companies")
      .update({ status: companyStatus })
      .eq("company_id", regData.company_id);

    if (updateCompanyError) {
      throw updateCompanyError;
    }
  }
};
