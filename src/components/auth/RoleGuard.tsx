"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/provider/authContext";
import type { UserRole } from "@/lib/auth/role-route";

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { loading, user, profile, refreshAuth } = useAuthContext();

  const hasCheckedRef = useRef(false);

  const allowedRoleKey = useMemo(() => {
    return allowedRoles.join("|");
  }, [allowedRoles]);

  useEffect(() => {
    if (loading) return;

    const checkPermission = async () => {
      if (hasCheckedRef.current) return;

      let currentUser = user;
      let currentProfile = profile;

      /**
       * Nếu user/profile chưa có, thử refresh lại trước.
       * Không đá /login ngay để tránh logout giả khi chuyển route.
       */
      if (!currentUser || !currentProfile) {
        const result = await refreshAuth();

        currentUser = result.user;
        currentProfile = result.profile;
      }

      /**
       * Sau khi refresh vẫn không có user thì mới về login.
       */
      if (!currentUser) {
        hasCheckedRef.current = true;
        router.replace("/login");
        return;
      }

      /**
       * Có user nhưng profile chưa load xong thì chờ.
       */
      if (!currentProfile) {
        return;
      }

      hasCheckedRef.current = true;

      /**
       * Có profile nhưng sai role thì quay lại trang trước đó.
       */
      if (!allowedRoles.includes(currentProfile.role)) {
        router.back();
      }
    };

    checkPermission();
  }, [
    loading,
    user,
    profile,
    refreshAuth,
    router,
    allowedRoles,
    allowedRoleKey,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile) {
    return null;
  }

  if (!allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}
