"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/provider/authContext";
import type { UserRole } from "@/provider/authContext";

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  console.log("ROLE GUARD MOUNTED", { allowedRoles });

  const router = useRouter();
  const { loading, user, profile, refreshAuth } = useAuthContext();

  const hasCheckedRef = useRef(false);
  const [checking, setChecking] = useState(true);

  const allowedRoleKey = useMemo(() => {
    return allowedRoles.join("|");
  }, [allowedRoles]);

  const isRoleAllowed = (role?: string | null) => {
    if (!role) return false;

    return allowedRoles.some(
      (allowedRole) => allowedRole.toLowerCase() === role.toLowerCase(),
    );
  };

  useEffect(() => {
    hasCheckedRef.current = false;
  }, [allowedRoleKey]);

  useEffect(() => {
    console.log("ROLE GUARD EFFECT START:", {
      loading,
      user: user?.email,
      profile,
      profileRole: profile?.role,
      allowedRoles,
    });

    if (loading) return;

    const checkPermission = async () => {
      if (hasCheckedRef.current) return;

      setChecking(true);

      let currentUser = user;
      let currentProfile = profile;

      if (!currentUser || !currentProfile) {
        console.log("ROLE GUARD REFRESH AUTH...");

        const result = await refreshAuth();

        console.log("ROLE GUARD REFRESH RESULT:", {
          user: result.user?.email,
          profile: result.profile,
          role: result.role,
        });

        currentUser = result.user;
        currentProfile = result.profile;
      }

      if (!currentUser) {
        console.log("ROLE GUARD NO USER -> LOGIN");

        hasCheckedRef.current = true;
        setChecking(false);
        router.replace("/login");
        return;
      }

      if (!currentProfile) {
        console.log("ROLE GUARD NO PROFILE");

        hasCheckedRef.current = true;
        setChecking(false);
        router.replace("/login");
        return;
      }

      const allowed = isRoleAllowed(currentProfile.role);

      console.log("ROLE GUARD CHECK:", {
        user: currentUser.email,
        profileRole: currentProfile.role,
        allowedRoles,
        isAllowed: allowed,
      });

      hasCheckedRef.current = true;
      setChecking(false);

      if (!allowed) {
        router.replace("/");
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

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  if (!isRoleAllowed(profile.role)) {
    console.log("ROLE GUARD BLOCKED:", {
      profileRole: profile.role,
      allowedRoles,
    });

    return null;
  }

  return <>{children}</>;
}
