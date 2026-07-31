"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getLandingPlans } from "@/features/payment/component/plans-data";
import { useAuthStore } from "@/store/auth.store";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/components/providers/LanguageProvider";
import CompanySearchBar from "@/features/company/components/CompanySearchBar";
import { requestGetCompanies } from "@/features/company/api/company.api";
import {
  ArrowRight,
  ChartColumn,
  CheckCircle2,
  FileSliders,
  HousePlus,
  Image,
  MapPinCheck,
  MapPin,
  ShieldUser,
  Shield,
  Users,
  Star,
  TrendingUp,
  TriangleAlert,
  UsersRound,
  Verified,
  Loader2,
  LogOut,
  Building2,
  X,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user_id);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const supabase = createClient();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [showRegisteredPopup, setShowRegisteredPopup] = useState(false);
  const { dict } = useTranslation();
  const landingPlans = getLandingPlans(dict);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTopCompanies() {
      try {
        const res = await requestGetCompanies({ page: 1, limit: 100 });
        if (res && res.companies) {
          // Sort companies by rating (descending), putting null at the bottom
          const sorted = [...res.companies].sort((a, b) => {
            const rA = a.rating ?? 0;
            const rB = b.rating ?? 0;
            return rB - rA;
          });
          setTopCompanies(sorted.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch top companies:", err);
      }
    }
    fetchTopCompanies();
  }, []);

  const handleStartClick = async (e: React.MouseEvent, targetHref: string) => {
    e.preventDefault();

    if (!userId) {
      router.push("/register-company");
      return;
    }

    try {
      setLoadingPlan(targetHref);
      const { data: compData, error } = await supabase
        .from("companies")
        .select("status")
        .eq("owner_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Check company status error:", error);
      }

      if (compData) {
        if (compData.status === "active" || compData.status === "published") {
          if (targetHref === "/register-company") {
            router.push("/dashboard");
          } else {
            router.push(targetHref);
          }
        } else {
          setShowRegisteredPopup(true);
        }
      } else {
        if (role === "customer") {
          setShowCustomerPopup(true);
        } else {
          router.push("/register-company");
        }
      }
    } catch (err) {
      console.error("Error checking company status:", err);
      router.push("/register-company");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      {/* Top sticky Navigation Navbar */}
      <Header />

      {/* Main Content Layout */}
      <main className="flex-1 mt-18 overflow-x-hidden">
        {/* ================= HERO SECTION ================= */}
        <section className="relative z-30 min-h-[440px] md:min-h-[480px] lg:min-h-[500px] flex items-center py-10 lg:py-14 bg-white">
          {/* Full-bleed Background Image with Right-aligned focus */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
            <img
              src="/images/hero-bg.jpg"
              alt="SGCMP Campus Security"
              className="w-full h-full object-cover object-[85%_center] brightness-[1.01] contrast-[1.02]"
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />
            {/* Left-to-Right white gradient fade for 100% crisp text readability across all words */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-[48%] xl:w-[45%] bg-gradient-to-r from-white via-white/95 via-white/85 to-transparent z-10" />
            {/* Bottom-to-Top subtle white fade */}
            <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-white via-white/40 to-transparent z-10" />
            {/* Mobile background overlay for readability */}
            <div className="block lg:hidden absolute inset-0 bg-white/85 z-10" />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-10 w-full relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
              {/* Left Column (55%): Content (Two-line Title & Compact Floating Search Bar) */}
              <div className="lg:col-span-7 flex flex-col items-start text-left gap-6 py-4">
                {/* Title styled with harmonious deep navy, royal blue gradient & white drop-shadow for 100% legibility */}
                <h1 className="font-sans text-[30px] sm:text-[36px] lg:text-[42px] font-black text-[#0A1D37] tracking-tight leading-[1.2] drop-shadow-[0_2px_12px_rgba(255,255,255,1)]">
                  {dict.hero.title}{" "}
                  <span className="block mt-0.5 text-transparent bg-clip-text bg-gradient-to-r from-[#0B5ED7] via-[#024594] to-[#0D6EFD]">
                    {dict.hero.titleAccent}
                  </span>
                </h1>

                {/* Description if present */}
                {dict.hero.description && (
                  <p className="font-sans text-[14px] md:text-[15px] text-slate-600 max-w-xl leading-relaxed font-normal">
                    {dict.hero.description}
                  </p>
                )}

                {/* Compact Floating Glassmorphic Search Bar (Adjusted width to touch right up against the character) */}
                <div className="w-full max-w-[590px] relative z-[999]">
                  <CompanySearchBar variant="large" />
                </div>
              </div>

              {/* Right Column (45%): Spacer so the security team & campus background show clearly */}
              <div className="lg:col-span-5 hidden lg:block h-[340px]" />
            </div>
          </div>
        </section>

        {/* ================= FEATURED COMPANIES SECTION ================= */}
        <section className="bg-surface py-8 relative z-10 border-b border-outline-variant/30">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {topCompanies.length > 0 ? (
                topCompanies.map((company) => {
                  const isNew = company.rating === null;
                  return (
                    <Link
                      key={company.id}
                      href={`/companies/${company.id}`}
                      className="group bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:border-primary/40 hover:ring-2 hover:ring-primary/15 hover:ring-offset-1 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-28 bg-surface-container-high overflow-hidden">
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={company.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400 opacity-90"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-secondary/15">
                            <span className="text-3xl font-black text-primary/25 uppercase">
                              {company.initials || company.name.slice(0, 2)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {/* Rating pill */}
                        <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{isNew ? dict.customer.search.new : company.rating?.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3 flex flex-col gap-1.5 flex-1 text-left bg-white">
                        <h3 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug" title={company.name}>
                          {company.name}
                        </h3>
                        <p className="text-[10px] text-on-surface-variant flex items-center gap-0.5 font-medium">
                          <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
                          <span className="truncate">{company.location}</span>
                        </p>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {company.tags && company.tags.slice(0, 2).map((tag: string, i: number) => (
                            <span key={i} className="bg-primary/8 text-primary text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {company.tags && company.tags.length > 2 && (
                            <span className="bg-surface-container text-on-surface-variant text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                              +{company.tags.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Price + Details button */}
                        <div className="mt-auto pt-2 border-t border-outline-variant/30 flex items-end justify-between gap-1">
                          <div>
                            <p className="text-[8px] font-bold text-outline uppercase tracking-wider mb-0.5">
                              {dict.customer.search.price_label}
                            </p>
                            <p className="text-[11px] font-extrabold text-primary">
                              {company.pricePerHour === 0 ? (
                                <span className="text-on-surface-variant font-semibold">
                                  {dict.customer.search.contact}
                                </span>
                              ) : company.serviceCount && company.serviceCount > 1 && company.maxPrice && company.maxPrice > company.pricePerHour ? (
                                <>
                                  {company.pricePerHour.toLocaleString("vi-VN")} - {company.maxPrice.toLocaleString("vi-VN")}
                                  <span className="text-[9px] font-normal text-on-surface-variant ml-0.5">/vnđ</span>
                                </>
                              ) : (
                                <>
                                  {company.pricePerHour.toLocaleString("vi-VN")}
                                  <span className="text-[9px] font-normal text-on-surface-variant ml-0.5">/vnđ</span>
                                </>
                              )}
                            </p>
                          </div>
                          <span className="shrink-0 h-6 px-2.5 bg-primary/8 text-primary text-[10px] font-bold rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-150 flex items-center justify-center whitespace-nowrap">
                            {dict.customer.search.view_detail}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                // Skeleton state matching Explore card
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden animate-pulse flex flex-col h-56">
                    <div className="h-28 bg-surface-container-high" />
                    <div className="p-3 flex flex-col gap-2">
                      <div className="h-3 bg-surface-container-high rounded w-3/4" />
                      <div className="h-2.5 bg-surface-container-high rounded w-1/2" />
                      <div className="h-2 bg-surface-container-high rounded w-full mt-1" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ================= TARGET AUDIENCE SECTION ================= */}
        <section className="py-12 md:py-14 bg-surface relative" id="gioi-thieu">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="font-sans text-[24px] md:text-[28px] font-bold text-on-surface mb-2 tracking-tight">
                {dict.landing.audience_title}
              </h2>
              <p className="font-sans text-[13px] md:text-[14px] text-on-surface-variant leading-relaxed">
                {dict.landing.audience_desc}
              </p>
            </div>

            {/* Target Audience Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Security Agency */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-xs hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 hover:bg-gradient-to-b hover:from-white hover:to-primary/5 hover:ring-2 hover:ring-primary/20 hover:ring-offset-1 transition-all duration-300 flex flex-col items-start text-left group cursor-pointer">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary shadow-xs group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <Building2 size={22} />
                </div>
                <h3 className="font-sans text-[17px] font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {dict.landing.company_card_title}
                </h3>
                <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed">
                  {dict.landing.company_card_desc}
                </p>
              </div>

              {/* Card 2: Customers */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-xs hover:shadow-lg hover:border-secondary/40 hover:-translate-y-1 hover:bg-gradient-to-b hover:from-white hover:to-secondary/5 hover:ring-2 hover:ring-secondary/20 hover:ring-offset-1 transition-all duration-300 flex flex-col items-start text-left group cursor-pointer">
                <div className="w-11 h-11 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 text-secondary shadow-xs group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-300">
                  <Users size={22} />
                </div>
                <h3 className="font-sans text-[17px] font-bold text-on-surface mb-2 group-hover:text-secondary transition-colors">
                  {dict.landing.customer_card_title}
                </h3>
                <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed">
                  {dict.landing.customer_card_desc}
                </p>
              </div>

              {/* Card 3: Security Staff */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-xs hover:shadow-lg hover:border-amber-500/40 hover:-translate-y-1 hover:bg-gradient-to-b hover:from-white hover:to-amber-500/5 hover:ring-2 hover:ring-amber-500/20 hover:ring-offset-1 transition-all duration-300 flex flex-col items-start text-left group cursor-pointer">
                <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 text-amber-600 shadow-xs group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                  <Shield size={22} />
                </div>

                <h3 className="font-sans text-[17px] font-bold text-on-surface mb-2 group-hover:text-amber-600 transition-colors">
                  {dict.landing.guard_card_title}
                </h3>
                <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed">
                  {dict.landing.guard_card_desc}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ================= PRICING / TRIAL SECTION ================= */}
        <section className="py-12 md:py-14 bg-surface" id="bang-gia">
          <div className="max-w-4xl mx-auto px-6">

            {/* ── Animated Running Border Wrapper ── */}
            <div className="relative p-[2px] rounded-3xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
              
              {/* Running Border Ray Animation */}
              <div
                className="absolute inset-[-150%] pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0 260deg, #0B5ED7 310deg, #60a5fa 340deg, #0A2A66 360deg)",
                  animation: "spin 4s linear infinite",
                }}
              />

              {/* Inner Card Content */}
              <div className="relative z-10 bg-white rounded-[22px] p-8 md:p-12 text-center flex flex-col items-center gap-6 overflow-hidden">
                {/* Background accent glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-colors duration-500" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10 group-hover:bg-secondary/20 transition-colors duration-500" />

                {/* Tag / Badge */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider group-hover:scale-105 transition-transform duration-300">
                  <CheckCircle2 size={16} />
                  <span>{dict.landing.plans.chuyen_nghiep.name} Solution</span>
                </div>

                {/* Title */}
                <h2 className="font-sans text-[26px] md:text-[32px] font-extrabold text-on-surface tracking-tight max-w-2xl">
                  {dict.landing.pricing_title}
                </h2>

                {/* General Description summarizing everything */}
                <p className="font-sans text-[14px] md:text-[15px] text-on-surface-variant max-w-2xl leading-relaxed">
                  {dict.landing.pricing_desc}
                </p>

                {/* Key Features Pill Badges */}
                <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl my-1">
                  {[
                    dict.landing.plans.chuyen_nghiep.f1,
                    dict.landing.plans.chuyen_nghiep.f2,
                    dict.landing.plans.chuyen_nghiep.f3,
                    dict.landing.plans.chuyen_nghiep.f4,
                    dict.landing.plans.chuyen_nghiep.f5,
                  ].map((feat, idx) => (
                    <span
                      key={idx}
                      className="bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-semibold px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-xs hover:border-primary/40 hover:bg-white hover:scale-[1.02] transition-all duration-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>

                {/* Start Trial Button Only */}
                <button
                  onClick={(e) => handleStartClick(e, "/register-company")}
                  disabled={loadingPlan !== null}
                  className="bg-primary hover:bg-primary-container text-on-primary font-bold py-3.5 px-10 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.04] active:scale-[0.98] text-[15px] h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loadingPlan === "/register-company" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {dict.landing.checking_plan}
                    </span>
                  ) : (
                    dict.landing.plans.chuyen_nghiep.action
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Customer Popup */}
      {showCustomerPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 size={20} />
                </div>
                <h3 className="text-[18px] font-bold text-on-surface">{dict.landing.popup_customer.title}</h3>
              </div>
              <button
                onClick={() => setShowCustomerPopup(false)}
                className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-on-surface-variant text-[15px] leading-relaxed">
                {dict.landing.popup_customer.desc}
              </p>
              <p className="mt-3 text-[14px] text-on-surface-variant">
                {dict.landing.popup_customer.hint}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-surface-container-lowest flex justify-end gap-3 border-t border-outline-variant/30">
              <button
                onClick={() => setShowCustomerPopup(false)}
                className="px-5 py-2.5 rounded-xl text-on-surface hover:bg-surface-container transition-all font-semibold text-[14px]"
              >
                {dict.landing.popup_customer.cancel}
              </button>
              <button
                onClick={() => {
                  setShowCustomerPopup(false);
                  clearAuth();
                  router.push("/register-company");
                }}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all shadow-sm font-semibold flex items-center gap-2 text-[14px]"
              >
                <LogOut size={18} />
                {dict.landing.popup_customer.logout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already Registered Popup */}
      {showRegisteredPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 size={20} />
                </div>
                <h3 className="text-[18px] font-bold text-on-surface">{dict.landing.popup_registered.title}</h3>
              </div>
              <button
                onClick={() => setShowRegisteredPopup(false)}
                className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-on-surface-variant text-[15px] leading-relaxed">
                {dict.landing.popup_registered.desc}
              </p>
              <p className="mt-3 text-[14px] text-on-surface-variant">
                {dict.landing.popup_registered.hint}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-surface-container-lowest flex justify-end gap-3 border-t border-outline-variant/30">
              <button
                onClick={() => setShowRegisteredPopup(false)}
                className="px-5 py-2.5 rounded-xl text-on-surface hover:bg-surface-container transition-all font-semibold text-[14px]"
              >
                {dict.landing.popup_registered.close}
              </button>
              <button
                onClick={() => {
                  setShowRegisteredPopup(false);
                  router.push("/my-registration");
                }}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all shadow-sm font-semibold flex items-center gap-2 text-[14px]"
              >
                {dict.landing.popup_registered.view}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
