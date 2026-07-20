"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Users, Loader2, UserRound, Phone, Mail } from "lucide-react";
import { requestGetCustomerGuardsByContract } from "@/features/guards/api/guard.api";
import { useAuthStore } from "@/store/auth.store";
import type { GuardListItem } from "@/features/guards/type";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CustomerContractGuardsInfoProps {
  contractId: string;
}

const formatGender = (gender: string | null | undefined, dict: any) => {
  const g = gender?.trim().toLowerCase() || "";
  if (g === "male" || g === "nam") {
    return { label: dict.contract.detail.gender_male, className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" };
  }
  if (g === "female" || g === "nữ" || g === "nư") {
    return { label: dict.contract.detail.gender_female, className: "bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300" };
  }
  return { label: dict.contract.detail.gender_other, className: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300" };
};

export function CustomerContractGuardsInfo({ contractId }: CustomerContractGuardsInfoProps) {
  const customerId = useAuthStore((state) => state.user_id) || "";
  const { dict } = useTranslation();
  const [assignedGuards, setAssignedGuards] = useState<GuardListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignedGuards = React.useCallback(async () => {
    if (!contractId || !customerId) return;
    try {
      setIsLoading(true);
      const res = await requestGetCustomerGuardsByContract({
        contractId,
        customerId,
        page: 1,
        limit: 100,
      });
      if (res && res.success) {
        setAssignedGuards(res.data?.guards || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách bảo vệ:", err);
    } finally {
      setIsLoading(false);
    }
  }, [contractId, customerId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssignedGuards();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAssignedGuards]);

  const getGuardProfile = (profiles: GuardListItem["profiles"]) => {
    if (!profiles) return null;
    return Array.isArray(profiles) ? (profiles[0] ?? null) : profiles;
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden flex-grow flex-shrink min-w-0">
      {/* Decorative top-right curved background circle */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/30 pb-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-headline">
            <Users className="w-5 h-5 text-primary" />
            <span>{dict.contract.detail.guards_info_title}</span>
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 font-body">
            {dict.contract.detail.guards_info_desc}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : assignedGuards.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-outline-variant/50 rounded-xl bg-surface-container-low/30">
          <UserRound className="w-10 h-10 text-outline-variant mx-auto mb-2.5" />
          <p className="text-sm font-semibold text-on-surface">{dict.contract.detail.guards_not_assigned}</p>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xs mx-auto">
            {dict.contract.detail.guards_not_assigned_desc}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 max-h-[400px] overflow-y-auto pr-1">
          {assignedGuards.map((guard) => {
            const profile = getGuardProfile(guard.profiles);
            if (!profile) return null;

            return (
              <div
                key={guard.guard_id}
                className="flex items-center gap-3.5 p-3 rounded-lg border border-outline-variant/60 bg-surface-container-low/40 hover:bg-surface-container-low transition-colors"
              >
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || ""}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border border-outline-variant"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                    <UserRound className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-on-surface truncate">
                    {profile.full_name || dict.contract.detail.guard_unnamed}
                  </h4>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {profile.phone_number && (
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <Phone className="w-3 h-3 shrink-0" />
                        {profile.phone_number}
                      </span>
                    )}
                    {profile.email && (
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1 truncate font-mono">
                        <Mail className="w-3 h-3 shrink-0" />
                        {profile.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {(() => {
                    const genderInfo = formatGender(profile.gender, dict);
                    return (
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${genderInfo.className}`}>
                        {genderInfo.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
