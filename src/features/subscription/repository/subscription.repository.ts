import { supabase } from "@/lib/supabase";
import { Plan } from "@/types/Plan";
import { Subscription } from "@/types/Subscription";
import { CurrentPlanWithSubscription, CompanySubscriptionCheckResult } from "../types";

export const getAllPlans = async (): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true);

  if (error) throw error;

  return (data as Plan[]) || [];
};

export const getPlanById = async (planId: number): Promise<Plan | null> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("plan_id", planId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows found
    throw error;
  }

  return (data as Plan) || null;
};

export const getCurrentActivePlan = async (
  companyId: string,
): Promise<CurrentPlanWithSubscription | null> => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plans (*)")
    .eq("company_id", companyId)
    .eq("status", "active")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("end_date", { ascending: false })
    .limit(1);

  if (error) throw error;

  if (!data || data.length === 0) {
    return null;
  }

  const dbSubscription = data[0];
  const dbPlan = dbSubscription.plans;

  if (!dbPlan) {
    return null;
  }

  return {
    plan: { ...dbPlan },
    subscription: {
      subscription_id: dbSubscription.subscription_id,
      start_date: dbSubscription.start_date,
      end_date: dbSubscription.end_date,
      status: dbSubscription.status,
      auto_renew: dbSubscription.auto_renew,
      company_id: dbSubscription.company_id,
      plan_id: dbSubscription.plan_id,
      created_at: dbSubscription.created_at,
      updated_at: dbSubscription.updated_at,
    },
  };
};

export const createSubscription = async (
  subscriptionData: Omit<Subscription, "subscription_id" | "created_at" | "updated_at">,
): Promise<Subscription> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert(subscriptionData)
    .select("*")
    .single();

  if (error) throw error;

  return (data as Subscription) || null;
};

export const activateSubscription = async (
  subscriptionId: string,
  startDate: string,
  endDate: string,
): Promise<Subscription> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      start_date: startDate,
      end_date: endDate,
      updated_at: new Date().toISOString(),
    })
    .eq("subscription_id", subscriptionId)
    .select("*")
    .single();

  if (error) throw error;

  return (data as Subscription) || null;
};

export const deactivateCompanySubscriptions = async (
  companyId: string,
  activeSubscriptionIdToKeep?: string,
): Promise<void> => {
  let query = supabase
    .from("subscriptions")
    .update({
      status: "unactive",
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId)
    .eq("status", "active");

  if (activeSubscriptionIdToKeep) {
    query = query.neq("subscription_id", activeSubscriptionIdToKeep);
  }

  const { error } = await query;

  if (error) throw error;
};

export const checkCompanySubscription = async (
  companyId: string,
): Promise<CompanySubscriptionCheckResult> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) {
    return {
      hasSubscription: false,
      isActive: false,
      subscription: null,
    };
  }

  const today = new Date().toISOString().split("T")[0];
  const activeSub = data.find(
    (sub) =>
      sub.status === "active" &&
      sub.start_date <= today &&
      sub.end_date >= today
  );

  return {
    hasSubscription: true,
    isActive: !!activeSub,
    subscription: (activeSub || data[0]) as Subscription,
  };
};

export const createPlan = async (
  planData: Omit<Plan, "plan_id" | "created_at" | "updated_at">,
): Promise<Plan> => {
  // Fetch the maximum plan_id currently in the plans table
  const { data: maxPlans, error: maxError } = await supabase
    .from("plans")
    .select("plan_id")
    .order("plan_id", { ascending: false })
    .limit(1);

  if (maxError) throw maxError;
  const nextPlanId = maxPlans && maxPlans.length > 0 ? maxPlans[0].plan_id + 1 : 1;

  const { data, error } = await supabase
    .from("plans")
    .insert({
      ...planData,
      plan_id: nextPlanId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Plan;
};

export const updatePlan = async (
  planId: number,
  planData: Partial<Omit<Plan, "plan_id" | "created_at" | "updated_at">>,
): Promise<Plan> => {
  const { data, error } = await supabase
    .from("plans")
    .update({
      ...planData,
      updated_at: new Date().toISOString(),
    })
    .eq("plan_id", planId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Plan;
};

export const deletePlan = async (planId: number): Promise<void> => {
  const { error } = await supabase
    .from("plans")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("plan_id", planId);

  if (error) throw error;
};


