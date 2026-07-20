import { createClient } from "@/lib/supabase/server";

import type { Service } from "@/types/Service";

export const getServiceById = async (
  serviceId: string,
): Promise<Service | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("service_id", serviceId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Service) || null;
};

export const getAllServices = async (): Promise<Service[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Service[]) || [];
};

export const createService = async (payload: {
  name: string;
  description?: string;
}): Promise<Service> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .insert({
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Service;
};

export const updateService = async (
  serviceId: string,
  payload: { name?: string; description?: string }
): Promise<Service> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .update({
      ...(payload.name !== undefined && { name: payload.name.trim() }),
      ...(payload.description !== undefined && { description: payload.description.trim() || null })
    })
    .eq("service_id", serviceId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  return data as Service;
};

export const deleteService = async (serviceId: string): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("services")
    .update({ is_active: false })
    .eq("service_id", serviceId);

  if (error) {
    throw error;
  }
};