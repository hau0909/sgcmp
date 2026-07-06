import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import {
  City,
  Ward,
  Service,
  UpdateCompanyProfileInput,
  UploadCompanyImageServiceParams,
  CompanyPublishRequestItem,
} from "../types";
import type { Company } from "@/types/Company";

const COMPANY_BUCKET = "companies";

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
    .select(
      `
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
    `,
    )
    .eq("status", "published")
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
  registrations?: {
    registration_code: string;
  }[];
}

export const getCompanyByIdWithDetails = async (
  id: string,
): Promise<DbCompanyDetail | null> => {
  const supabaseServer = await createClient();

  const { data, error } = await supabaseServer
    .from("companies")
    .select(
      `
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
      ),
      registrations (
        registration_code
      )
    `,
    )
    .eq("company_id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as any) || null;
};

export const getCompanyById = async (
  companyId: string,
): Promise<Company | null> => {
  const supabaseServer = await createClient();

  const { data, error } = await supabaseServer
    .from("companies")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Company) || null;
};

export const updateCompanyprofile = async ({
  company_id,
  input,
}: {
  company_id: string;
  input: UpdateCompanyProfileInput;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .update({
      company_name: input.company_name,
      description: input.description,
      email: input.email,
      phone: input.phone,
      address: input.address,
    })
    .eq("company_id", company_id)
    .select(
      `
      company_id,
      company_name,
      description,
      email,
      phone,
      address,
      business_license_no
    `,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateRegistrationCodeByCompanyId = async ({
  company_id,
  registration_code,
}: {
  company_id: string;
  registration_code: string;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("registrations")
    .update({ registration_code, updated_at: new Date().toISOString() })
    .eq("company_id", company_id)
    .select(
      `
      registration_id,
      registration_code
    `,
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const uploadCompanyImage = async ({
  company_id,
  file,
  image_type,
}: UploadCompanyImageServiceParams) => {
  const supabase = await createClient();

  const file_extension = file.name.split(".").pop()?.toLowerCase();

  if (!file_extension) {
    throw new Error("Không xác định được định dạng ảnh.");
  }

  const file_name = `${image_type}-${Date.now()}-${crypto.randomUUID()}.${file_extension}`;

  // Bucket: companies
  // Path trong bucket: {company_id}/images/{file_name}
  const file_path = `${company_id}/images/${file_name}`;

  const { error: upload_error } = await supabase.storage
    .from(COMPANY_BUCKET)
    .upload(file_path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (upload_error) {
    throw new Error(upload_error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(COMPANY_BUCKET).getPublicUrl(file_path);

  if (image_type === "logo" || image_type === "banner") {
    const { data: existingImage, error: find_error } = await supabase
      .from("company_imgs")
      .select("image_id")
      .eq("company_id", company_id)
      .eq("image_type", image_type)
      .maybeSingle();

    if (find_error) {
      await supabase.storage.from(COMPANY_BUCKET).remove([file_path]);
      throw new Error(find_error.message);
    }

    const { data, error: upsert_error } = await supabase
      .from("company_imgs")
      .upsert(
        {
          image_id: existingImage?.image_id ?? crypto.randomUUID(),
          company_id,
          image_url: publicUrl,
          image_type,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: "image_id",
        },
      )
      .select("image_id, company_id, image_url, image_type, created_at")
      .single();

    if (upsert_error) {
      await supabase.storage.from(COMPANY_BUCKET).remove([file_path]);
      throw new Error(upsert_error.message);
    }

    return {
      ...data,
      file_path,
    };
  }

  const { data, error: insert_error } = await supabase
    .from("company_imgs")
    .insert({
      image_id: crypto.randomUUID(),
      company_id,
      image_url: publicUrl,
      image_type,
      created_at: new Date().toISOString(),
    })
    .select("image_id, company_id, image_url, image_type, created_at")
    .single();

  if (insert_error) {
    await supabase.storage.from(COMPANY_BUCKET).remove([file_path]);
    throw new Error(insert_error.message);
  }

  return {
    ...data,
    file_path,
  };
};

export const getCompanyActivityImages = async (company_id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("company_imgs")
    .select("image_id, company_id, image_url, image_type, created_at")
    .eq("company_id", company_id)
    .eq("image_type", "other")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createCompanyPublishRequest = async (
  companyId: string,
  requestedBy: string,
  note?: string,
): Promise<{ request_id: string }> => {
  const supabaseServer = await createClient();

  // 1. Insert into company_publish_requests
  const { data: requestData, error: requestError } = await supabaseServer
    .from("company_publish_requests")
    .insert({
      company_id: companyId,
      requested_by: requestedBy,
      status: "PENDING",
      notes: note || null,
      requested_at: new Date().toISOString(),
    })
    .select("request_id")
    .single();

  if (requestError) {
    throw new Error(requestError.message);
  }

  // 2. Update company status to pending_publish
  const { error: companyError } = await supabaseServer
    .from("companies")
    .update({
      status: "pending_publish",
    })
    .eq("company_id", companyId);

  if (companyError) {
    throw new Error(companyError.message);
  }

  return requestData;
};

export const getCompanyPublishRequests = async (): Promise<CompanyPublishRequestItem[]> => {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from("company_publish_requests")
    .select("request_id, company_id, status, notes, requested_at, requested_by, approved_by, processed_at, companies(company_name, owner_id)")
    .order("requested_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as any) || [];
};

export const getCompanyPublishRequestById = async (
  requestId: string,
): Promise<any | null> => {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from("company_publish_requests")
    .select("request_id, company_id, status, notes, requested_at, requested_by, approved_by, processed_at")
    .eq("request_id", requestId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateCompanyPublishRequestStatus = async (
  requestId: string,
  status: "APPROVED" | "REJECTED",
  approvedBy?: string,
): Promise<void> => {
  const supabaseServer = await createClient();

  // 1. Get the publish request details to find the company_id
  const { data: requestData, error: fetchError } = await supabaseServer
    .from("company_publish_requests")
    .select("company_id")
    .eq("request_id", requestId)
    .maybeSingle();

  if (fetchError || !requestData) {
    throw new Error(fetchError?.message || "Không tìm thấy yêu cầu phát hành.");
  }

  const { company_id } = requestData;

  // 2. Update the publish request status
  const { error: updateError } = await supabaseServer
    .from("company_publish_requests")
    .update({
      status,
      approved_by: approvedBy || null,
      processed_at: new Date().toISOString(),
    })
    .eq("request_id", requestId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // 3. Update the company status
  const companyStatus = status === "APPROVED" ? "published" : "active";
  const { error: companyError } = await supabaseServer
    .from("companies")
    .update({
      status: companyStatus,
    })
    .eq("company_id", company_id);

  if (companyError) {
    throw new Error(companyError.message);
  }
};
