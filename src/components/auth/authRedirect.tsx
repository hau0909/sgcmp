"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/provider/authContext";
import { getRedirectPathByRole } from "@/lib/auth/role-route";

export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  const { loading, user, profile, refreshAuth } = useAuthContext();

  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (hasCheckedRef.current) return;

    const checkSessionAndRedirect = async () => {
      hasCheckedRef.current = true;

      /**
       * Chỉ auto redirect ở các trang public.
       * Không can thiệp khi đang ở dashboard/profile/admin...
       */
      const publicPaths = ["/", "/login", "/register", "/sign-up"];
      const isPublicPath = publicPaths.includes(pathname);

      if (!isPublicPath) {
        return;
      }

      let currentUser = user;
      let currentProfile = profile;

      /**
       * Khi mở lại web, AuthContext có thể chưa có profile.
       * Nên refreshAuth để đọc session từ cookie.
       */
      if (!currentUser || !currentProfile) {
        const result = await refreshAuth();

        currentUser = result.user;
        currentProfile = result.profile;
      }

      if (!currentUser || !currentProfile) {
        return;
      }

      const redirectPath = getRedirectPathByRole(currentProfile.role);

      if (pathname !== redirectPath) {
        router.replace(redirectPath);
      }
    };

    checkSessionAndRedirect();
  }, [loading, pathname, user, profile, refreshAuth, router]);

  return null;
}
