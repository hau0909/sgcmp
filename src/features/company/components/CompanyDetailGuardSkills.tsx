"use client";

import React from "react";
import {
  ShieldCheck,
  Award,
  Flame,
  Activity,
  Zap,
  Eye,
  HeartPulse,
  UserCheck,
  Sparkles,
  Lock,
  Languages,
  AlertTriangle,
  BadgeCheck,
  Users,
} from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { GuardSkillSummary } from "../types";

interface CompanyDetailGuardSkillsProps {
  guardSkillsSummary?: GuardSkillSummary[];
  totalApprovedGuards?: number;
}

const getSkillIcon = (skillName: string) => {
  const lower = skillName.toLowerCase();
  if (lower.includes("sơ cấp cứu") || lower.includes("y tế") || lower.includes("first aid")) {
    return <HeartPulse className="w-5 h-5 text-emerald-500" />;
  }
  if (lower.includes("võ thuật") || lower.includes("tự vệ") || lower.includes("martial")) {
    return <ShieldCheck className="w-5 h-5 text-amber-500" />;
  }
  if (lower.includes("pccc") || lower.includes("cháy") || lower.includes("cứu hộ") || lower.includes("fire")) {
    return <Flame className="w-5 h-5 text-rose-500" />;
  }
  if (lower.includes("cctv") || lower.includes("giám sát") || lower.includes("camera")) {
    return <Eye className="w-5 h-5 text-indigo-500" />;
  }
  if (lower.includes("kiểm soát") || lower.includes("ra vào") || lower.includes("access")) {
    return <UserCheck className="w-5 h-5 text-blue-500" />;
  }
  if (lower.includes("khẩn cấp") || lower.includes("sự cố") || lower.includes("emergency")) {
    return <Zap className="w-5 h-5 text-yellow-500" />;
  }
  if (lower.includes("tiếng anh") || lower.includes("ngôn ngữ") || lower.includes("english")) {
    return <Languages className="w-5 h-5 text-cyan-500" />;
  }
  if (lower.includes("tuần tra") || lower.includes("patrol")) {
    return <Activity className="w-5 h-5 text-purple-500" />;
  }
  return <Award className="w-5 h-5 text-primary" />;
};

export default function CompanyDetailGuardSkills({
  guardSkillsSummary = [],
  totalApprovedGuards = 0,
}: CompanyDetailGuardSkillsProps) {
  const { dict } = useTranslation();
  const t = dict.customer?.company_detail || {};

  const hasSkills = guardSkillsSummary && guardSkillsSummary.length > 0;

  return (
    <section className="py-8 border-b border-outline-variant/60">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{t.guard_skills_eyebrow || "Năng lực lực lượng bảo vệ"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
            {t.guard_skills_title || "Kỹ năng nổi bật của lực lượng bảo vệ"}
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {t.guard_skills_sub ||
              "Được tổng hợp từ hồ sơ kiểm duyệt thực tế của đội ngũ bảo vệ thuộc công ty"}
          </p>
        </div>

        {totalApprovedGuards > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Users className="w-4 h-4 text-primary" />
            <span>
              {totalApprovedGuards}{" "}
              {t.guard_skills_verified_guards || "lực lượng bảo vệ đã kiểm duyệt"}
            </span>
          </div>
        )}
      </div>

      {!hasSkills ? (
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-center space-y-2">
          <BadgeCheck className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {t.guard_skills_empty ||
              "Thông tin kỹ năng nổi bật của lực lượng bảo vệ đang được cập nhật."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {guardSkillsSummary.map((skill, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/40 transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getSkillIcon(skill.skillName)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                    {skill.skillName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-on-surface-variant">
                    <span className="font-semibold text-on-surface">
                      {skill.count}
                    </span>
                    <span>
                      {t.guard_skills_guards_count || "nhân viên sở hữu"}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                  {skill.percentage}%
                </span>
              </div>

              {/* Visual Percentage Bar */}
              <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, skill.percentage))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
