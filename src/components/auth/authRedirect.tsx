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
      const isPublicPath = publicPaths.includes(pathname);

      if (!isPublicPath) return;

      try {
        const result = (await requestGetUserProfile()) as ApiResponse;

        if (!result?.success) return;

        const profile = getProfileFromResponse(result.data);

        if (!profile?.role) return;

        if (profile.status && profile.status !== "active") {
          router.replace("/unauthorized?reason=inactive");
          return;
        }

        const redirectPath = getRedirectPathByRole(profile.role);

        if (pathname !== redirectPath) {
          router.replace(redirectPath);
        }
      } catch (error) {
        console.error("AUTH REDIRECT ERROR:", error);
      }
    };

    checkSessionAndRedirect();
  }, [pathname, router]);

  return null;
}
