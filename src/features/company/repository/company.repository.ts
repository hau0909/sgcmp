import { supabase } from "@/lib/supabase";
import { City, Ward, Service } from "../types";

export interface DbCompany {
  company_id: string;
  owner_id: string;
  company_name: string;
  business_license_no: string;
  license_file_url?: string;
  address: any;
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

export interface DbCompanyDetail {
  company_id: string;
  owner_id: string;
  company_name: string;
  business_license_no: string;
  license_file_url?: string;
  address: any;
  description?: string;
  rating_average: number | null;
  status: string;
  created_at: string;
  email: string;
  phone: string;
  company_imgs?: {
    image_url: string;
    image_type: string;
  }[];
  company_services?: {
    price: number;
    description: string | null;
    services: {
      service_id: string;
      name: string;
      description: string;
    } | null;
  }[];
}

export const getCompanyById = async (id: string): Promise<DbCompanyDetail | null> => {
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
      email,
      phone,
      company_imgs (
        image_url,
        image_type
      ),
      company_services (
        price,
        description,
        services (
          service_id,
          name,
          description
        )
      )
    `)
    .eq("company_id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as any) || null;
};
