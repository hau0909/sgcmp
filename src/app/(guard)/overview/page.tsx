"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { requestGetGuardMyProfile } from "@/features/guards/api/guard.api";
import { AlertTriangle, Clock, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type ApprovalStatus = "pending_profile" | "pending_approval" | "approved" | "rejected" | null;

type OverviewApprovalDict = {
  loading: string;
  pending_profile_title: string;
  pending_profile_desc: string;
  pending_profile_action: string;
  pending_approval_title: string;
  pending_approval_desc: string;
  rejected_title: string;
  rejected_desc: string;
  rejected_action: string;
  rejection_note_label: string;
  rejection_note_empty: string;
};

const ApprovalBanner = ({
  status,
  rejectionNote,
  t,
}: {
  status: ApprovalStatus;
  rejectionNote?: string | null;
  t: OverviewApprovalDict;
}) => {
  if (!status || status === "approved") return null;

  const configs = {
    pending_profile: {
      bg: "bg-blue-50 border-blue-200",
      icon: <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
      title: t.pending_profile_title,
      desc: t.pending_profile_desc,
      action: (
        <Link
          href="/complete-profile"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
        >
          {t.pending_profile_action}
        </Link>
      ),
    },
    pending_approval: {
      bg: "bg-amber-50 border-amber-200",
      icon: <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
      title: t.pending_approval_title,
      desc: t.pending_approval_desc,
      action: null,
    },
    rejected: {
      bg: "bg-red-50 border-red-200",
      icon: <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
      title: t.rejected_title,
      desc: t.rejected_desc,
      action: (
        <Link
          href="/complete-profile"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors"
        >
          {t.rejected_action}
        </Link>
      ),
    },
  };

  const cfg = configs[status];
  if (!cfg) return null;

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} flex gap-3`}>
      {cfg.icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800">{cfg.title}</p>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{cfg.desc}</p>
        {status === "rejected" && (
          <div className="mt-2 rounded-lg bg-red-100 px-3 py-2">
            <p className="text-[11px] font-bold text-red-500 uppercase tracking-wide mb-0.5">
              {t.rejection_note_label}
            </p>
            <p className="text-xs text-red-800 font-medium leading-relaxed">
              {rejectionNote ?? t.rejection_note_empty}
            </p>
          </div>
        )}
        {cfg.action}
      </div>
    </div>
  );
};

const OverviewPage = () => {
  const { dict } = useTranslation();
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(null);
  const [rejectionNote, setRejectionNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const t: OverviewApprovalDict = dict.layout_guard?.overview_approval ?? {
    loading: "Đang tải...",
    pending_profile_title: "Hồ sơ chưa hoàn thiện",
    pending_profile_desc: "Bạn cần hoàn thiện thông tin hồ sơ cá nhân trước khi có thể nhận ca trực.",
    pending_profile_action: "Hoàn thiện hồ sơ ngay →",
    pending_approval_title: "Đang chờ phê duyệt",
    pending_approval_desc: "Hồ sơ của bạn đã được gửi và đang chờ Điều phối viên xét duyệt.",
    rejected_title: "Hồ sơ bị từ chối",
    rejected_desc: "Hồ sơ của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và gửi lại.",
    rejected_action: "Cập nhật hồ sơ →",
    rejection_note_label: "Lý do từ chối",
    rejection_note_empty: "Không có ghi chú từ Điều phối viên.",
  };

  useEffect(() => {
    let mounted = true;
    requestGetGuardMyProfile()
      .then((res) => {
        if (!mounted) return;
        const guard = res?.data?.guard;
        if (guard?.approval_status) {
          setApprovalStatus(guard.approval_status as ApprovalStatus);
          setRejectionNote(guard.rejection_note ?? null);
        }
      })
      .catch(() => {/* silently ignore */})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-4 py-6">
      {loading ? (
        <div className="flex items-center justify-center py-6 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">{t.loading}</span>
        </div>
      ) : (
        <>
          <ApprovalBanner status={approvalStatus} rejectionNote={rejectionNote} t={t} />

          <div className="flex justify-center items-center py-6 text-lg font-semibold text-slate-800">
            {dict.layout_guard.welcome}
          </div>
        </>
      )}
    </div>
  );
};

export default OverviewPage;
