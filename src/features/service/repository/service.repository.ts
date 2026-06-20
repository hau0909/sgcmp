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