"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getRedirectPathByRole } from "@/features/auth/utils/redirectByRole";
import { requestGetUserProfile } from "@/features/auth/api/auth.api";

type Profile = {
  role?: string | null;
  status?: string | null;
};

type ApiResponse = {
  success: boolean;
  data?:
  | {
    user?: unknown;
    profile?: Profile | null;
    role?: string | null;
    status?: string | null;
  }
  | Profile
  | null;
  message?: string;
};

const getProfileFromResponse = (data: ApiResponse["data"]) => {
  if (!data) return null;

  if ("profile" in data) {
    return data.profile ?? null;
  }

  return data as Profile;
};

export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const publicPaths = ["/", "/login", "/register", "/sign-up"];
      const companyRelatedPaths = ["/companies", "/register-company"];
      const profilePaths = ["/profile"];

      const isPublicPath = publicPaths.includes(pathname);
      const isCompanyRelatedPath = companyRelatedPaths.includes(pathname);
      const isProfilePath = profilePaths.includes(pathname);

      if (!isPublicPath && !isCompanyRelatedPath && !isProfilePath) return;

      try {
        const result = (await requestGetUserProfile()) as ApiResponse;

        if (!result?.success) {
          if (isProfilePath) {
            router.replace("/login");
          }
          return;
        }

        const profile = getProfileFromResponse(result.data);

        if (!profile?.role) {
          if (isProfilePath) {
            router.replace("/login");
          }
          return;
        }

        if (profile.status === "banned") {
          router.replace("/unauthorized?reason=banned");
          return;
        }

        if (profile.status && profile.status !== "active") {
          router.replace("/unauthorized?reason=inactive");
          return;
        }

        const redirectPath = getRedirectPathByRole(profile.role);
        const userRole = profile.role.toLowerCase();

        if (userRole === "customer") {
          if (["/login", "/register", "/sign-up"].includes(pathname)) {
            router.replace("/");
          }
        } else {
          const targetIsRestricted = ["/", "/login", "/register", "/sign-up", "/companies", "/register-company"].includes(pathname);
          if (targetIsRestricted && pathname !== redirectPath) {
            router.replace(redirectPath);
          }
        }
      } catch (error) {
        console.error("AUTH REDIRECT ERROR:", error);
      }
    };

    checkSessionAndRedirect();
  }, [pathname, router]);

  return null;
}
