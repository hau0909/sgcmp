"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getLandingPlans } from "@/features/payment/component/plans-data";
import { useAuthStore } from "@/store/auth.store";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/components/providers/LanguageProvider";
import {
  ArrowRight,
  ChartColumn,
  CheckCircle2,
  FileSliders,
  HousePlus,
  Image,
  MapPinCheck,
  ShieldUser,
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
        <section className="relative bg-surface-container-lowest pt-20 pb-28 md:pt-24 md:pb-36 overflow-hidden">
          {/* Accent lighting gradients */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-surface-container-lowest to-surface-container-lowest z-0" />
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content Column */}
              <div className="flex flex-col gap-6 md:gap-8 max-w-xl text-left">
                <h1 className="font-sans text-[42px] leading-12.5 md:text-[56px] md:leading-16 font-extrabold text-on-surface tracking-tight">
                  {dict.hero.title}{" "}
                  <span className="text-primary bg-clip-text">
                    {dict.hero.titleAccent}
                  </span>{" "}
                  {dict.hero.titleSuffix}
                </h1>

                <p className="font-sans text-[16px] leading-6.5 md:text-[18px] md:leading-7 text-on-surface-variant">
                  {dict.hero.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a
                    className="bg-primary hover:bg-primary-container text-on-primary font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] text-[15px] h-12"
                    href="/register-company"
                    onClick={(e) => handleStartClick(e, "/register-company")}
                  >
                    {dict.hero.startFree}
                    <ArrowRight />
                  </a>
                  <a
                    className="border border-outline-variant hover:border-primary text-on-surface hover:bg-surface-container-low font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-[15px] h-12"
                    href="#tinh-nang"
                  >
                    {dict.hero.features}
                  </a>
                </div>
              </div>

              {/* Right Mockup Showcase Column */}
              <div className="relative lg:ml-8 animate-slide-up">
                {/* Main Premium Mockup Window Container */}
                <div className="rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden bg-surface-container-lowest relative z-10 ring-1 ring-black/5 hover:shadow-hover hover:border-primary/20 transition-all duration-500">
                  {/* Browser Bar */}
                  <div className="bg-surface-container-low h-8 border-b border-outline-variant/30 flex items-center px-4 gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-error" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  {/* Dashboard Preview Image */}
                  <img
                    alt="SGCMP Dashboard Preview"
                    className="w-full object-cover transition-transform duration-500 hover:scale-[1.01]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW55OiUHSEmPUbf5Ug0UlgBPFji5Jq3xI166izmmV66I_cbHdS1UE2SUp4IZ34OQqtiOzOGIya69guXaDqMDhQSo_eBpxPypqHMrScU8yPE0xP751uiO-thsEY7SMpFncfCyUQEKMywKT0FOETJHgZav2G5svFZvBuPN-UeMWn0nao_J2P3cdqEJDKNyh-2V0Rjd33hanIcWnRIowlCNf2WnYel2pBs3QUShMiZLnJpyoEC_NXk0oWjWD9_oi_HtQ0A6p8MBBx0ZAu"
                  />
                </div>

                {/* Floating Elements (Micro-interactions) */}
                <div className="absolute -bottom-8 -left-12 backdrop-blur-md bg-white/80 p-5 rounded-xl shadow-xl flex items-center gap-4 z-20 border border-white/40 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm">
                    <CheckCircle2 />
                  </div>
                  <div>
                    <p className="font-sans text-[11px] text-outline uppercase tracking-widest font-bold mb-0.5">
                      {dict.hero.systemStatus}
                    </p>
                    <p className="font-sans text-[15px] font-bold text-on-surface">
                      {dict.hero.systemStatusActive}
                    </p>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 backdrop-blur-md bg-white/80 p-4 rounded-xl shadow-xl z-20 border border-white/40 hover:-translate-y-0.5 transition-transform duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <TrendingUp />
                    </div>
                    <div>
                      <p className="font-sans text-[11px] text-outline uppercase tracking-widest font-bold">
                        {dict.hero.performance}
                      </p>
                      <p className="font-sans text-[14px] font-bold text-primary">
                        {dict.hero.performanceIncrease}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TARGET AUDIENCE SECTION ================= */}
        <section className="py-24 bg-surface relative" id="gioi-thieu">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 z-0" />
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-sans text-[32px] md:text-[36px] font-bold text-on-surface mb-6 tracking-tight">
                {dict.landing.audience_title}
              </h2>
              <p className="font-sans text-[16px] md:text-[18px] text-on-surface-variant leading-relaxed">
                {dict.landing.audience_desc}
              </p>
            </div>

            {/* Target Audience Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Card 1: Security Agency */}
              <div className="bg-surface-container-lowest p-10 rounded-2xl border border-outline-variant/40 shadow-sm hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start text-left">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary shadow-inner">
                  <HousePlus size={35} />
                </div>
                <h3 className="font-sans text-[22px] font-bold text-on-surface mb-4">
                  {dict.landing.company_card_title}
                </h3>
                <p className="font-sans text-[15px] text-on-surface-variant leading-relaxed">
                  {dict.landing.company_card_desc}
                </p>
              </div>

              {/* Card 2: Customers */}
              <div className="bg-surface-container-lowest p-10 rounded-2xl border border-outline-variant/40 shadow-sm hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start text-left">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-8 text-secondary shadow-inner">
                  <UsersRound size={35} />
                </div>
                <h3 className="font-sans text-[22px] font-bold text-on-surface mb-4">
                  {dict.landing.customer_card_title}
                </h3>
                <p className="font-sans text-[15px] text-on-surface-variant leading-relaxed">
                  {dict.landing.customer_card_desc}
                </p>
              </div>

              {/* Card 3: Security Staff */}
              <div className="bg-surface-container-lowest p-10 rounded-2xl border border-outline-variant/40 shadow-sm hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start text-left">
                <div className="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center mb-8 text-tertiary shadow-inner">
                  <ShieldUser size={35} />
                </div>

                <h3 className="font-sans text-[22px] font-bold text-on-surface mb-4">
                  {dict.landing.guard_card_title}
                </h3>
                <p className="font-sans text-[15px] text-on-surface-variant leading-relaxed">
                  {dict.landing.guard_card_desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CORE FEATURES SECTION ================= */}
        <section className="py-24 bg-surface-container-lowest" id="tinh-nang">
          <div className="max-w-7xl mx-auto px-8">
            {/* Section Header */}
            <div className="mb-16 text-left max-w-3xl">
              <h2 className="font-sans text-[32px] md:text-[36px] font-bold text-on-surface mb-4 tracking-tight">
                {dict.landing.features_title}
              </h2>
              <p className="font-sans text-[16px] md:text-[18px] text-on-surface-variant">
                {dict.landing.features_desc}
              </p>
            </div>

            {/* Grid Features layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Feature 1: Large Span Calendar Schedule */}
              <div className="md:col-span-8 bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 md:p-10 flex flex-col justify-between overflow-hidden group hover:shadow-hover hover:border-primary/20 transition-all duration-300 relative min-h-95">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="z-10 text-left">
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-8 border border-outline-variant/20 text-primary">
                    <FileSliders size={35} />
                  </div>
                  <h3 className="font-sans text-[24px] font-bold text-on-surface mb-4">
                    {dict.landing.feat1_title}
                  </h3>
                  <p className="font-sans text-[15px] md:text-[16px] text-on-surface-variant mb-8 max-w-xl leading-relaxed">
                    {dict.landing.feat1_desc}
                  </p>
                </div>

                {/* Interactive schedule preview block */}
                <div className="mt-auto bg-white rounded-xl border border-outline-variant/20 p-5 flex flex-col gap-3 shadow-xs z-10 transition-transform duration-300 group-hover:-translate-y-0.5">
                  <div className="flex gap-3 items-center">
                    <div className="text-[12px] font-semibold text-primary w-24 bg-primary/10 py-1 px-2 rounded-md text-center">
                      {dict.landing.feat1_ui1}
                    </div>
                    <div className="h-6 flex-1 bg-surface-container rounded-md flex items-center px-3 text-[11px] text-outline">
                      {dict.landing.feat1_ui2}
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="text-[12px] font-semibold text-secondary w-24 bg-secondary/10 py-1 px-2 rounded-md text-center">
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
              <div className="md:col-span-4 bg-surface border border-outline-variant/30 rounded-3xl p-8 flex flex-col justify-between hover:shadow-hover hover:border-primary/30 transition-all duration-300 text-left min-h-95 group">
                <div>
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center border border-outline-variant/20 mb-8 text-primary">
                    <MapPinCheck size={35} />
                  </div>
                  <h3 className="font-sans text-[20px] font-bold text-on-surface mb-3">
                    {dict.landing.feat2_title}
                  </h3>
                  <p className="font-sans text-[15px] text-on-surface-variant leading-relaxed mb-6">
                    {dict.landing.feat2_desc}
                  </p>
                </div>

                <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/20 flex items-center gap-3 mt-auto shadow-xs group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Verified />
                  </div>
                  <span className="text-[13px] font-semibold text-on-surface">
                    {dict.landing.feat2_ui}
                  </span>
                </div>
              </div>

              {/* Feature 3: Real-time Incident Reports */}
              <div className="md:col-span-6 bg-surface border border-outline-variant/30 rounded-3xl p-8 flex flex-col justify-between hover:shadow-hover hover:border-error/30 transition-all duration-300 text-left min-h-80 group">
                <div>
                  <div className="w-14 h-14 bg-error/10 rounded-xl flex items-center justify-center mb-8 text-error">
                    <TriangleAlert size={35} />
                  </div>
                  <h3 className="font-sans text-[20px] font-bold text-on-surface mb-3">
                    {dict.landing.feat3_title}
                  </h3>
                  <p className="font-sans text-[15px] text-on-surface-variant leading-relaxed mb-6">
                    {dict.landing.feat3_desc}
                  </p>
                </div>

                <div className="flex gap-3 mt-auto items-center group-hover:translate-x-1 transition-transform duration-300">
                  <div className="h-14 w-14 bg-surface-container-high rounded-lg flex items-center justify-center text-outline border border-outline-variant/30">
                    <Image size={35} />
                  </div>
                  <div className="flex-1 bg-surface-container rounded-lg p-2.5">
                    <div className="w-1/3 h-2 bg-error/60 rounded-full mb-2" />
                    <div className="w-2/3 h-1.5 bg-outline-variant/50 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Feature 4: Performance Analytics */}
              <div className="md:col-span-6 bg-surface border border-outline-variant/30 rounded-3xl p-8 flex flex-col justify-between hover:shadow-hover hover:border-secondary/30 transition-all duration-300 text-left min-h-80 group">
                <div>
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-8 text-secondary">
                    <ChartColumn size={35} />
                  </div>
                  <h3 className="font-sans text-[20px] font-bold text-on-surface mb-3">
                    {dict.landing.feat4_title}
                  </h3>
                  <p className="font-sans text-[15px] text-on-surface-variant leading-relaxed mb-6">
                    {dict.landing.feat4_desc}
                  </p>
                </div>

                {/* Visual Bar Chart Animation Placeholder */}
                <div className="flex items-end gap-3 h-16 mt-auto px-2">
                  <div className="w-full bg-secondary/20 rounded-t-md h-[30%] group-hover:h-[45%] transition-all duration-500" />
                  <div className="w-full bg-secondary/40 rounded-t-md h-[60%] group-hover:h-[75%] transition-all duration-500" />
                  <div className="w-full bg-secondary/60 rounded-t-md h-[45%] group-hover:h-[60%] transition-all duration-500" />
                  <div className="w-full bg-secondary rounded-t-md h-[90%] group-hover:h-full transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PRICING SECTION ================= */}
        <section className="py-24 bg-surface" id="bang-gia">
          <div className="max-w-7xl mx-auto px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-sans text-[32px] md:text-[36px] font-bold text-on-surface mb-4 tracking-tight">
                {dict.landing.pricing_title}
              </h2>
              <p className="font-sans text-[16px] md:text-[18px] text-on-surface-variant">
                {dict.landing.pricing_desc}
              </p>
            </div>

            {/* Pricing Cards Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch pt-8">
              {landingPlans.map((plan) => {
                return (
                  <div
                    key={plan.id}
                    className={`bg-surface-container-lowest border rounded-3xl p-8 md:p-10 flex flex-col justify-between text-left transition-all duration-300
                      ${
                        plan.isPopular
                          ? "border-2 border-primary shadow-xl transform md:-translate-y-4 relative"
                          : "border-outline-variant/40 hover:shadow-soft"
                      }`}
                  >
                    {plan.isPopular && (
                      /* Popular Badge */
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-linear-to-r from-primary to-secondary text-white px-6 py-1.5 rounded-full font-sans text-[11px] font-bold uppercase tracking-widest shadow-md">
                        {dict.landing.popular_badge}
                      </div>
                    )}

                    <div>
                      <h3
                        className={`font-sans text-[22px] font-bold mb-2
                          ${plan.isPopular ? "text-primary mt-2" : "text-on-surface"}`}
                      >
                        {plan.name}
                      </h3>
                      <p className="font-sans text-[13px] text-on-surface-variant mb-8 h-10 leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="mb-8 flex items-baseline gap-1">
                        <span className="font-sans text-[36px] md:text-[40px] font-extrabold text-on-surface tracking-tight transition-all duration-300">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="font-sans text-[13px] font-medium text-on-surface-variant">
                            {plan.period}
                          </span>
                        )}
                      </div>

                      <ul className="flex flex-col gap-4 mb-10">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className={`flex items-center gap-3 text-[14px] text-on-surface
                              ${plan.isPopular && idx === 0 ? "font-semibold" : ""}`}
                          >
                            <CheckCircle2 className="text-primary text-[20px]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={(e) => handleStartClick(e, plan.href)}
                      disabled={loadingPlan !== null}
                      className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-[14px] h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          plan.isPopular
                            ? "bg-primary hover:bg-primary-container text-on-primary shadow-md hover:shadow-lg hover:scale-[1.02]"
                            : "border border-outline-variant hover:border-primary text-on-surface hover:bg-surface-container-low"
                        }`}
                    >
                      {loadingPlan === plan.href ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {dict.landing.checking_plan}
                        </span>
                      ) : (
                        plan.actionText
                      )}
                    </button>
                  </div>
                );
              })}
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
