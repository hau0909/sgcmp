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
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-r from-blue-50/50 via-white to-white flex items-center min-h-[600px] lg:min-h-[640px]">
          {/* Background image on the right with fading mask */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-[55%] z-0 pointer-events-none select-none overflow-hidden">
            <img
              src="/images/hero-bg.jpg"
              alt="SGCMP Security Guards"
              className="w-full h-full object-cover object-center brightness-[1.01] contrast-[1.01]"
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />
            {/* Smooth Left-to-Right fading gradient */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-72 lg:w-96 bg-gradient-to-r from-white via-white/90 to-transparent z-10" />
            {/* Smooth Bottom-to-Top fading gradient */}
            <div className="absolute bottom-0 inset-x-0 h-40 md:h-64 bg-gradient-to-t from-white via-white/80 to-transparent z-10" />
            {/* Smooth Top-to-Bottom fading gradient */}
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/90 to-transparent z-10" />
            {/* Mobile overlay for readability */}
            <div className="block lg:hidden absolute inset-0 bg-white/85 z-10" />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-8 w-full relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
              {/* Left Column: Content (Title, Description, Search) */}
              <div className="lg:col-span-7 flex flex-col items-start text-left gap-6 py-6 lg:py-12">
                {/* Title */}
                <h1 className="font-sans text-[36px] leading-[1.2] md:text-[50px] md:leading-[1.15] font-black text-slate-900 tracking-tight">
                  {dict.hero.title}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                    {dict.hero.titleAccent}
                  </span>{" "}
                  {dict.hero.titleSuffix}
                </h1>

                {/* Description */}
                <p className="font-sans text-[14px] md:text-[15px] text-slate-500 max-w-xl leading-relaxed font-normal">
                  {dict.hero.description}
                </p>

                {/* Search Bar */}
                <div className="w-full max-w-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-full bg-white relative z-[999]">
                  <CompanySearchBar variant="large" />
                </div>
              </div>

              {/* Right Column: Empty space so background image shows fully */}
              <div className="lg:col-span-5 hidden lg:block h-[450px]" />
            </div>
          </div>
        </section>

        {/* ================= FEATURED COMPANIES SECTION ================= */}
        <section className="bg-surface py-8 relative border-b border-outline-variant/30">
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

        {/* ================= CORE FEATURES SECTION ================= */}
        <section className="py-12 md:py-14 bg-surface-container-lowest" id="tinh-nang">
          <div className="max-w-6xl mx-auto px-6">
            {/* Section Header */}
            <div className="mb-8 text-center md:text-left max-w-2xl">
              <h2 className="font-sans text-[24px] md:text-[28px] font-bold text-on-surface mb-2 tracking-tight">
                {dict.landing.features_title}
              </h2>
              <p className="font-sans text-[13px] md:text-[14px] text-on-surface-variant">
                {dict.landing.features_desc}
              </p>
            </div>

            {/* Grid Features layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Feature 1: Large Span Calendar Schedule */}
              <div className="md:col-span-8 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 md:p-7 flex flex-col justify-between overflow-hidden group hover:shadow-lg hover:border-primary/40 hover:ring-2 hover:ring-primary/15 hover:ring-offset-1 transition-all duration-300 relative min-h-72 cursor-pointer">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-500" />
                <div className="z-10 text-left">
                  <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center mb-5 border border-outline-variant/20 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                    <FileSliders size={24} />
                  </div>
                  <h3 className="font-sans text-[18px] md:text-[20px] font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                    {dict.landing.feat1_title}
                  </h3>
                  <p className="font-sans text-[13px] md:text-[14px] text-on-surface-variant mb-6 max-w-xl leading-relaxed">
                    {dict.landing.feat1_desc}
                  </p>
                </div>

                {/* Interactive schedule preview block */}
                <div className="mt-auto bg-white rounded-xl border border-outline-variant/20 p-4 flex flex-col gap-2.5 shadow-xs z-10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                  <div className="flex gap-3 items-center">
                    <div className="text-[11px] font-semibold text-primary w-24 bg-primary/10 py-1 px-2 rounded-md text-center">
                      {dict.landing.feat1_ui1}
                    </div>
                    <div className="h-6 flex-1 bg-surface-container rounded-md flex items-center px-3 text-[11px] text-outline">
                      {dict.landing.feat1_ui2}
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="text-[11px] font-semibold text-secondary w-24 bg-secondary/10 py-1 px-2 rounded-md text-center">
                      {dict.landing.feat1_ui3}
                    </div>
                    <div className="h-6 w-45 bg-secondary/15 rounded-md flex items-center px-3 text-[11px] text-secondary font-medium">
                      {dict.landing.feat1_ui4}
                    </div>
                    <div className="h-6 flex-1 bg-surface-container rounded-md flex items-center px-3 text-[11px] text-outline">
                      {dict.landing.feat1_ui5}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: GPS Check-in */}
              <div className="md:col-span-4 bg-surface border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary/40 hover:ring-2 hover:ring-primary/15 hover:ring-offset-1 transition-all duration-300 text-left min-h-72 group cursor-pointer">
                <div>
                  <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center border border-outline-variant/20 mb-5 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                    <MapPinCheck size={24} />
                  </div>
                  <h3 className="font-sans text-[18px] font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                    {dict.landing.feat2_title}
                  </h3>
                  <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed mb-4">
                    {dict.landing.feat2_desc}
                  </p>
                </div>

                <div className="bg-surface-container-lowest rounded-lg p-3.5 border border-outline-variant/20 flex items-center gap-3 mt-auto shadow-xs group-hover:scale-[1.03] group-hover:bg-green-50/40 transition-all duration-300">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Verified size={16} />
                  </div>
                  <span className="text-[12px] font-semibold text-on-surface">
                    {dict.landing.feat2_ui}
                  </span>
                </div>
              </div>

              {/* Feature 3: Real-time Incident Reports */}
              <div className="md:col-span-6 bg-surface border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-error/40 hover:ring-2 hover:ring-red-500/15 hover:ring-offset-1 transition-all duration-300 text-left min-h-64 group cursor-pointer">
                <div>
                  <div className="w-11 h-11 bg-error/10 rounded-xl flex items-center justify-center mb-5 text-error group-hover:scale-110 group-hover:bg-error/20 transition-all duration-300">
                    <TriangleAlert size={24} />
                  </div>
                  <h3 className="font-sans text-[18px] font-bold text-on-surface mb-2 group-hover:text-error transition-colors">
                    {dict.landing.feat3_title}
                  </h3>
                  <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed mb-4">
                    {dict.landing.feat3_desc}
                  </p>
                </div>

                <div className="flex gap-3 mt-auto items-center group-hover:translate-x-1.5 transition-transform duration-300">
                  <div className="h-11 w-11 bg-surface-container-high rounded-lg flex items-center justify-center text-outline border border-outline-variant/30">
                    <Image size={24} />
                  </div>
                  <div className="flex-1 bg-surface-container rounded-lg p-2.5">
                    <div className="w-1/3 h-2 bg-error/60 rounded-full mb-2" />
                    <div className="w-2/3 h-1.5 bg-outline-variant/50 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Feature 4: Performance Analytics */}
              <div className="md:col-span-6 bg-surface border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-secondary/40 hover:ring-2 hover:ring-secondary/15 hover:ring-offset-1 transition-all duration-300 text-left min-h-64 group cursor-pointer">
                <div>
                  <div className="w-11 h-11 bg-secondary/10 rounded-xl flex items-center justify-center mb-5 text-secondary group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-300">
                    <ChartColumn size={24} />
                  </div>
                  <h3 className="font-sans text-[18px] font-bold text-on-surface mb-2 group-hover:text-secondary transition-colors">
                    {dict.landing.feat4_title}
                  </h3>
                  <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed mb-4">
                    {dict.landing.feat4_desc}
                  </p>
                </div>

                {/* Visual Bar Chart Animation Placeholder */}
                <div className="flex items-end gap-3 h-12 mt-auto px-2">
                  <div className="w-full bg-secondary/20 rounded-t-md h-[30%] group-hover:h-[50%] transition-all duration-500" />
                  <div className="w-full bg-secondary/40 rounded-t-md h-[60%] group-hover:h-[80%] transition-all duration-500" />
                  <div className="w-full bg-secondary/60 rounded-t-md h-[45%] group-hover:h-[65%] transition-all duration-500" />
                  <div className="w-full bg-secondary rounded-t-md h-[90%] group-hover:h-full transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PRICING / TRIAL SECTION ================= */}
        <section className="py-12 md:py-14 bg-surface" id="bang-gia">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 md:p-12 text-center shadow-lg hover:shadow-2xl hover:border-primary/40 hover:ring-2 hover:ring-primary/20 hover:ring-offset-2 transition-all duration-300 relative overflow-hidden flex flex-col items-center gap-6 group">
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
