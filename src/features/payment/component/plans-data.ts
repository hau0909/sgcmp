export interface LandingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceVal: number; // Base price for calculations (monthly)
  period: string;
  features: string[];
  isPopular?: boolean;
  actionText: string;
  href: string;
}

export const getLandingPlans = (dict: any): LandingPlan[] => [
  {
    id: "co-ban",
    name: dict.landing.plans.co_ban.name,
    description: dict.landing.plans.co_ban.desc,
    price: "250.000",
    priceVal: 250000,
    period: dict.landing.plans.co_ban.period,
    features: [
      dict.landing.plans.co_ban.f1,
      dict.landing.plans.co_ban.f2,
      dict.landing.plans.co_ban.f3
    ],
    actionText: dict.landing.plans.co_ban.action,
    href: "/billing/payment/co-ban"
  },
  {
    id: "chuyen-nghiep",
    name: dict.landing.plans.chuyen_nghiep.name,
    description: dict.landing.plans.chuyen_nghiep.desc,
    price: "500.000",
    priceVal: 500000,
    period: dict.landing.plans.chuyen_nghiep.period,
    features: [
      dict.landing.plans.chuyen_nghiep.f1,
      dict.landing.plans.chuyen_nghiep.f2,
      dict.landing.plans.chuyen_nghiep.f3,
      dict.landing.plans.chuyen_nghiep.f4
    ],
    isPopular: true,
    actionText: dict.landing.plans.chuyen_nghiep.action,
    href: "/billing/payment/chuyen-nghiep"
  },
  {
    id: "doanh-nghiep",
    name: dict.landing.plans.doanh_nghiep.name,
    description: dict.landing.plans.doanh_nghiep.desc,
    price: dict.landing.plans.doanh_nghiep.price || "Tùy chỉnh",
    priceVal: 1250000, // Custom monthly equivalent (1.250.000 * 12 = 15.000.000 VNĐ total)
    period: dict.landing.plans.doanh_nghiep.period,
    features: [
      dict.landing.plans.doanh_nghiep.f1,
      dict.landing.plans.doanh_nghiep.f2,
      dict.landing.plans.doanh_nghiep.f3
    ],
    actionText: dict.landing.plans.doanh_nghiep.action,
    href: "/billing/payment/doanh-nghiep"
  }
];
