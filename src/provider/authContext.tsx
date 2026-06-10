"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type UserRole =
  | "customer"
  | "admin"
  | "company-admin"
  | "guard"
  | "Coordinator";

export type GeneralStatus = "active" | "inactive" | "pending" | "blocked";

export type Profile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone_number?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  status: GeneralStatus;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Company = {
  company_id: string;
  owner_id: string;
  company_name: string;
  business_license_no?: string | null;
  license_file_url?: string | null;
  address?: string | null;
  description?: string | null;
  rating_average?: number | null;
  status: GeneralStatus;
  created_at?: string | null;
};

export type RefreshAuthResult = {
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  role: UserRole | null;
  companyId: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  role: UserRole | null;
  companyId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<RefreshAuthResult>;
  clearAuthState: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const emptyAuthResult: RefreshAuthResult = {
  user: null,
  profile: null,
  company: null,
  role: null,
  companyId: null,
};

const normalizeRole = (role: string | null | undefined): UserRole => {
  const normalizedRole = (role || "customer").toLowerCase();

  if (normalizedRole === "customer") return "customer";
  if (normalizedRole === "admin") return "admin";
  if (normalizedRole === "company-admin") return "company-admin";
  if (normalizedRole === "guard") return "guard";
  if (normalizedRole === "coordinator") return "Coordinator";

  return "customer";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(false);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setProfile(null);
    setCompany(null);
    setRole(null);
    setCompanyId(null);
  }, []);

  const getCurrentAuthResult = useCallback((): RefreshAuthResult => {
    return {
      user,
      profile,
      company,
      role,
      companyId,
    };
  }, [user, profile, company, role, companyId]);

  const loadUserData = useCallback(
    async (authUser: User): Promise<RefreshAuthResult> => {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "user_id, email, full_name, phone_number, gender, date_of_birth, address, role, avatar_url, status, created_at, updated_at",
        )
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!mountedRef.current) {
        return emptyAuthResult;
      }

      if (profileError || !profileData) {
        setUser(authUser);
        setProfile(null);
        setCompany(null);
        setRole(null);
        setCompanyId(null);

        return {
          user: authUser,
          profile: null,
          company: null,
          role: null,
          companyId: null,
        };
      }

      const currentProfile: Profile = {
        ...(profileData as Profile),
        role: normalizeRole(profileData.role),
      };

      setUser(authUser);
      setProfile(currentProfile);
      setRole(currentProfile.role);

      let currentCompany: Company | null = null;
      let currentCompanyId: string | null = null;

      if (
        currentProfile.status === "active" &&
        currentProfile.role === "company-admin"
      ) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select(
            "company_id, owner_id, company_name, business_license_no, license_file_url, address, description, rating_average, status, created_at",
          )
          .eq("owner_id", authUser.id)
          .maybeSingle();

        if (!mountedRef.current) {
          return emptyAuthResult;
        }

        if (!companyError && companyData) {
          currentCompany = companyData as Company;
          currentCompanyId = currentCompany.company_id;
        }
      }

      setCompany(currentCompany);
      setCompanyId(currentCompanyId);

      return {
        user: authUser,
        profile: currentProfile,
        company: currentCompany,
        role: currentProfile.role,
        companyId: currentCompanyId,
      };
    },
    [supabase],
  );

  const refreshAuth = useCallback(async (): Promise<RefreshAuthResult> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      /**
       * Quan trọng:
       * Nếu refresh bị lỗi tạm thời thì không clearAuthState ngay.
       * Nếu clear ngay, khi chuyển route app sẽ tưởng user logout.
       */
      if (error || !session?.user) {
        return getCurrentAuthResult();
      }

      if (mountedRef.current) {
        setUser(session.user);
      }

      return await loadUserData(session.user);
    } catch {
      return getCurrentAuthResult();
    }
  }, [supabase, loadUserData, getCurrentAuthResult]);

  useEffect(() => {
    mountedRef.current = true;

    const initAuth = async () => {
      setLoading(true);

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mountedRef.current) return;

        if (error || !session?.user) {
          clearAuthState();
          return;
        }

        setUser(session.user);

        await loadUserData(session.user);
      } catch {
        if (!mountedRef.current) return;

        clearAuthState();
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;

      if (event === "SIGNED_OUT") {
        clearAuthState();
        setLoading(false);
        return;
      }

      /**
       * Không clear auth khi session tạm thời null,
       * trừ khi event là SIGNED_OUT.
       */
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUser(session.user);
      setLoading(false);

      setTimeout(async () => {
        if (!mountedRef.current) return;

        try {
          await loadUserData(session.user);
        } catch {
          /**
           * Không clear user ở đây.
           * Chỉ clear profile/company để tránh bị logout giả.
           */
          if (!mountedRef.current) return;

          setProfile(null);
          setCompany(null);
          setRole(null);
          setCompanyId(null);
        }
      }, 0);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [supabase, clearAuthState, loadUserData]);

  const value: AuthContextType = {
    user,
    profile,
    company,
    role,
    companyId,
    loading,
    isAuthenticated: !!user,
    refreshAuth,
    clearAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
};
