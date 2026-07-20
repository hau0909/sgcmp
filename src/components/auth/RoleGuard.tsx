"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/auth/role-route";
import { requestGetUserProfile } from "@/features/auth/api/auth.api";
import { useTranslation } from "@/components/providers/LanguageProvider";

type RouteGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

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
      }
    | Profile
    | null;
  message?: string;
};

const isRoleAllowed = (
  role: string | null | undefined,
  allowedRoles: UserRole[],
) => {
  if (!role) return false;

  return allowedRoles.some(
    (allowedRole) => allowedRole.toLowerCase() === role.toLowerCase(),
  );
};

const getProfileFromResponse = (data: ApiResponse["data"]) => {
  if (!data) return null;

  if ("profile" in data) {
    return data.profile ?? null;
  }

  return data as Profile;
};

export default function RouteGuard({
  allowedRoles,
  children,
}: RouteGuardProps) {
  const router = useRouter();
  const { dict } = useTranslation();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const allowedRoleKey = useMemo(() => {
    return allowedRoles.map((role) => role.toLowerCase()).join("|");
  }, [allowedRoles]);

  useEffect(() => {
    const checkPermission = async () => {
      setChecking(true);
      setAllowed(false);

      try {
        const result = (await requestGetUserProfile()) as ApiResponse;

        if (!result?.success) {
          router.replace("/login");
          return;
        }

        const profile = getProfileFromResponse(result.data);

        if (!profile) {
          router.replace("/login");
          return;
        }

        if (profile.status !== "active") {
          router.replace("/unauthorized?reason=inactive");
          return;
        }

        if (!isRoleAllowed(profile.role, allowedRoles)) {
          router.replace("/unauthorized");
          return;
        }

        setAllowed(true);
      } catch (error) {
        console.error("ROUTE GUARD ERROR:", error);
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };

    checkPermission();
  }, [router, allowedRoleKey]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {dict.pages.registration.checking}
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
