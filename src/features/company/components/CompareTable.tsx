"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  X,
  Star,
  CheckSquare,
  Calendar,
  MapPin,
  FileText,
  DollarSign,
  Shield,
  Award,
} from "lucide-react";
import { requestGetCompanyById } from "../api/company.api";
import { CompanyDetailData } from "../types";
import { useCompareStore } from "@/store/compare.store";
import { useTranslation } from "@/components/providers/LanguageProvider";

export default function CompareTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const initialIds = idsParam ? idsParam.split(",").filter(Boolean) : [];

  const { removeCompany } = useCompareStore();
  const { dict } = useTranslation();
  const t = dict.customer?.compare || ({} as any);

  const [companyIds, setCompanyIds] = useState<string[]>(initialIds);
  const [companies, setCompanies] = useState<(CompanyDetailData | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state when URL params change
  useEffect(() => {
    const ids = idsParam ? idsParam.split(",").filter(Boolean) : [];
    setCompanyIds(ids);
  }, [idsParam]);

  // Fetch full company detail data for each ID
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (companyIds.length === 0) {
        setCompanies([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const results = await Promise.all(
          companyIds.map(async (id) => {
            try {
              return await requestGetCompanyById(id);
            } catch (err) {
              console.error(`Error fetching company ${id}:`, err);
              return null;
            }
          })
        );
        if (mounted) {
          setCompanies(results);
        }
      } catch (err) {
        console.error("Error loading comparison data:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [companyIds]);

  const handleRemove = (id: string) => {
    removeCompany(id);
    const updatedIds = companyIds.filter((item) => item !== id);
    setCompanyIds(updatedIds);
    if (updatedIds.length > 0) {
      router.replace(`/companies/compare?ids=${updatedIds.join(",")}`);
    } else {
      router.push("/companies");
    }
  };

  const currentYear = new Date().getFullYear();

  // Helper for formatting initials
  const getInitials = (name: string) => {
    if (!name) return "CO";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Helper to format operating years
  const formatOperatingYears = (comp: CompanyDetailData) => {
    if (comp.createdYear) {
      const years = currentYear - comp.createdYear;
      if (years > 0) {
        return (t.years_active || "{years} năm (từ {year})")
          .replace("{years}", String(years))
          .replace("{year}", String(comp.createdYear));
      }
      return (t.new_member || "Mới tham gia ({year})").replace(
        "{year}",
        String(comp.createdYear)
      );
    }
    if (comp.createdAt) {
      const year = new Date(comp.createdAt).getFullYear();
      const years = currentYear - year;
      if (years > 0) {
        return (t.years_active || "{years} năm (từ {year})")
          .replace("{years}", String(years))
          .replace("{year}", String(year));
      }
      return (t.new_member || "Mới tham gia ({year})").replace(
        "{year}",
        String(year)
      );
    }
    return (t.new_member || "Mới tham gia ({year})").replace(
      "{year}",
      String(currentYear)
    );
  };

  // Helper to format price display
  const formatPrice = (comp: CompanyDetailData) => {
    if (!comp.services || comp.services.length === 0) {
      return t.contact_price || "Liên hệ";
    }
    const prices = comp.services
      .map((s) => s.price)
      .filter((p) => p > 0);
    if (prices.length === 0) {
      return t.contact_price || "Liên hệ";
    }
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (prices.length > 1 && maxPrice > minPrice) {
      return `${minPrice.toLocaleString("vi-VN")} – ${maxPrice.toLocaleString(
        "vi-VN"
      )} /vnđ`;
    }
    return `${minPrice.toLocaleString("vi-VN")} /vnđ`;
  };

  const validCompanies = companies.filter(Boolean) as CompanyDetailData[];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* ── Top Navigation / Back link ────────────────────────── */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back_to_list || "Quay lại danh sách"}</span>
        </Link>
      </div>

      {/* ── Header Title Section ────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">
          {t.page_title || "So sánh công ty"}
        </h1>
        <p className="text-xs text-on-surface-variant mt-1 font-medium">
          {(
            t.page_subtitle ||
            "Đối chiếu thông tin cơ bản của {count} công ty đã chọn"
          ).replace("{count}", String(validCompanies.length))}
        </p>
      </div>

      {/* Empty State */}
      {companyIds.length === 0 || (!isLoading && validCompanies.length === 0) ? (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-12 text-center space-y-4">
          <p className="text-sm text-on-surface-variant font-medium">
            {t.no_companies || "Chưa chọn công ty nào để so sánh"}
          </p>
          <Link
            href="/companies"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
          >
            {t.back_to_list || "Quay lại danh sách"}
          </Link>
        </div>
      ) : (
        /* ── Comparison Table Container ─────────────────────────── */
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                {/* ── Header Row: Logos & Names ────────────────────────── */}
                <tr className="border-b border-outline-variant/40">
                  {/* Left Criteria Label Column Header */}
                  <th className="w-52 p-4 bg-surface-container-low/50 shrink-0 font-normal text-on-surface-variant text-xs">
                    {/* Empty label column header */}
                  </th>

                  {/* Company Columns Header */}
                  {isLoading
                    ? companyIds.map((id) => (
                      <th
                        key={id}
                        className="p-6 text-center border-l border-outline-variant/30 animate-pulse"
                      >
                        <div className="w-16 h-16 rounded-full bg-surface-container-high mx-auto mb-3" />
                        <div className="h-4 bg-surface-container-high rounded w-3/4 mx-auto" />
                      </th>
                    ))
                    : validCompanies.map((comp) => (
                      <th
                        key={comp.id}
                        className="p-6 text-center border-l border-outline-variant/30 relative min-w-[240px] align-top bg-surface-container-lowest"
                      >
                        {/* Remove button (X) */}
                        <button
                          onClick={() => handleRemove(comp.id)}
                          className="absolute top-3 right-3 p-1 rounded-full text-outline hover:text-error hover:bg-surface-container-high transition-colors cursor-pointer"
                          title={t.remove_company || "Bỏ khỏi so sánh"}
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Logo / Initials */}
                        <div className="flex justify-center mb-3">
                          {comp.logoUrl ? (
                            <img
                              src={comp.logoUrl}
                              alt={comp.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-xs"
                            />
                          ) : (
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-white text-lg shadow-xs"
                              style={{
                                background: `hsl(${(comp.id.charCodeAt(0) * 45) % 360
                                  }, 45%, 40%)`,
                              }}
                            >
                              {getInitials(comp.name)}
                            </div>
                          )}
                        </div>

                        {/* Company Name */}
                        <h3
                          className="text-xs sm:text-sm font-bold text-on-surface line-clamp-2 uppercase leading-snug tracking-tight px-2"
                          title={comp.name}
                        >
                          {comp.name}
                        </h3>
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/30 text-xs">
                {/* ── 1. Đánh giá (Rating) ──────────────────────────────── */}
                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-bold text-on-surface bg-surface-container-low/40 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>{t.col_rating || "Đánh giá"}</span>
                  </td>
                  {validCompanies.map((comp) => (
                    <td
                      key={comp.id}
                      className="p-4 text-center border-l border-outline-variant/30 text-on-surface font-semibold"
                    >
                      {comp.rating && comp.rating > 0 ? (
                        <div className="inline-flex items-center gap-1 font-bold text-on-surface">
                          <span className="text-sm">{comp.rating.toFixed(1)}</span>
                          <span className="text-on-surface-variant font-normal text-[11px]">
                            ({comp.totalReviews || 0})
                          </span>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant font-normal">
                          {t.no_rating || "Chưa có đánh giá"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* ── 2. Hợp đồng hoàn thành (Completed Contracts) ────────── */}
                <tr className="hover:bg-surface-container-low/30 transition-colors bg-emerald-50/30">
                  <td className="p-4 font-bold text-on-surface bg-surface-container-low/40 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>{t.col_contracts || "Hợp đồng hoàn thành"}</span>
                  </td>
                  {validCompanies.map((comp) => (
                    <td
                      key={comp.id}
                      className="p-4 text-center border-l border-outline-variant/30 text-emerald-700 font-extrabold text-sm"
                    >
                      {comp.completedContracts ?? 0}
                    </td>
                  ))}
                </tr>

                {/* ── 3. Năm hoạt động (Years of Operation) ────────────────── */}
                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-bold text-on-surface bg-surface-container-low/40 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{t.col_years || "Năm hoạt động"}</span>
                  </td>
                  {validCompanies.map((comp) => (
                    <td
                      key={comp.id}
                      className="p-4 text-center border-l border-outline-variant/30 text-on-surface font-medium"
                    >
                      {formatOperatingYears(comp)}
                    </td>
                  ))}
                </tr>

                {/* ── 4. Địa chỉ (Address) ──────────────────────────────── */}
                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-bold text-on-surface bg-surface-container-low/40 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>{t.col_address || "Địa chỉ"}</span>
                  </td>
                  {validCompanies.map((comp) => (
                    <td
                      key={comp.id}
                      className="p-4 text-center border-l border-outline-variant/30 text-on-surface-variant font-normal leading-relaxed max-w-[220px]"
                    >
                      {comp.address || "—"}
                    </td>
                  ))}
                </tr>

                {/* ── 5. Dịch vụ (Services) ──────────────────────────────── */}
                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-bold text-on-surface bg-surface-container-low/40 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-secondary" />
                    <span>{t.col_services || "Dịch vụ"}</span>
                  </td>
                  {validCompanies.map((comp) => (
                    <td
                      key={comp.id}
                      className="p-4 text-center border-l border-outline-variant/30 text-on-surface font-medium"
                    >
                      {comp.services && comp.services.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1">
                          {comp.services.map((s, idx) => (
                            <span
                              key={idx}
                              className="bg-primary/8 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-on-surface-variant font-normal">
                          {t.no_services || "Chưa cập nhật"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* ── 6. Kỹ năng nổi bật (Notable Skills) ────────────────── */}
                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-bold text-on-surface bg-surface-container-low/40 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>{t.col_notable_skills || "Kỹ năng nổi bật"}</span>
                  </td>
                  {validCompanies.map((comp) => {
                    const skills =
                      comp.notable_skills && comp.notable_skills.length > 0
                        ? comp.notable_skills
                        : comp.guardSkillsSummary?.map((s) => s.skillName) || [];

                    return (
                      <td
                        key={comp.id}
                        className="p-4 text-center border-l border-outline-variant/30 text-on-surface font-medium"
                      >
                        {skills.length > 0 ? (
                          <div className="flex flex-col items-center gap-1.5">
                            {Array.from({ length: Math.ceil(skills.length / 3) }).map(
                              (_, rIdx) => {
                                const rowSkills = skills.slice(rIdx * 3, rIdx * 3 + 3);
                                return (
                                  <div
                                    key={rIdx}
                                    className="flex flex-wrap justify-center gap-1"
                                  >
                                    {rowSkills.map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="bg-purple-500/10 text-purple-700 border border-purple-200/60 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <span className="text-on-surface-variant font-normal">
                            {t.no_skills || "Chưa cập nhật"}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* ── 6. Giá dịch vụ (Service Price) ──────────────────────── */}
                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-bold text-on-surface bg-surface-container-low/40 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span>{t.col_price || "Giá dịch vụ"}</span>
                  </td>
                  {validCompanies.map((comp) => (
                    <td
                      key={comp.id}
                      className="p-4 text-center border-l border-outline-variant/30 text-primary font-extrabold text-sm"
                    >
                      {formatPrice(comp)}
                    </td>
                  ))}
                </tr>

                {/* ── 7. Action Button Row ─────────────────────────────── */}
                <tr>
                  <td className="p-4 bg-surface-container-low/40" />
                  {validCompanies.map((comp) => (
                    <td
                      key={comp.id}
                      className="p-4 text-center border-l border-outline-variant/30 bg-surface-container-lowest"
                    >
                      <Link
                        href={`/companies/${comp.id}`}
                        className="inline-flex items-center justify-center w-full py-2 px-4 bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold rounded-xl text-xs transition-all duration-150 cursor-pointer"
                      >
                        {t.view_detail || "Xem chi tiết"}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
