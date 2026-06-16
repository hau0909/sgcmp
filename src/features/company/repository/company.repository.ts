import { supabase } from "@/lib/supabase";
import { City, Ward, Service } from "../types";

export interface DbCompany {
  company_id: string;
  owner_id: string;
  company_name: string;
  business_license_no: string;
  license_file_url?: string;
  address: string;
  description?: string;
  rating_average: number | null;
  status: string;
  created_at: string;
  company_services?: {
    price: number;
    services: {
      service_id: string;
      name: string;
    } | null;
  }[];
}


export const getAllActiveCompanies = async (): Promise<DbCompany[]> => {
  const { data, error } = await supabase
    .from("companies")
    .select(`
      company_id,
      owner_id,
      company_name,
      business_license_no,
      license_file_url,
      address,
      description,
      rating_average,
      status,
      created_at,
      company_services (
        price,
        services (
          service_id,
          name
        )
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as any[]) || [];
};

export const getCities = async (): Promise<City[]> => {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("city_name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as City[]) || [];
};

export const getWards = async (): Promise<Ward[]> => {
  const { data, error } = await supabase
    .from("wards")
    .select("*")
    .order("ward_name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Ward[]) || [];
};

export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Service[]) || [];
};
