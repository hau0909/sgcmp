import { supabase } from "@/lib/supabase";
import { RegistrationWithCompany } from "../types";

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
