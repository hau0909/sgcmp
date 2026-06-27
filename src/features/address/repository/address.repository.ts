import { supabase } from "@/lib/supabase";
import { City, Ward } from "../types";

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

export const getWardsByCityId = async (cityId: number): Promise<Ward[]> => {
  const { data, error } = await supabase
    .from("wards")
    .select("*")
    .eq("city_id", cityId)
    .order("ward_name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Ward[]) || [];
};

export const getAddressDetails = async (
  cityId: number,
  wardId: number
): Promise<{ cityName: string | null; wardName: string | null }> => {
  const [cityResult, wardResult] = await Promise.all([
    supabase.from("cities").select("city_name").eq("city_id", cityId).maybeSingle(),
    supabase.from("wards").select("ward_name").eq("ward_id", wardId).maybeSingle(),
  ]);

  if (cityResult.error) throw cityResult.error;
  if (wardResult.error) throw wardResult.error;

  return {
    cityName: cityResult.data?.city_name || null,
    wardName: wardResult.data?.ward_name || null,
  };
};
