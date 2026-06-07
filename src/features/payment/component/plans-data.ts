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

export const LANDING_PLANS: LandingPlan[] = [
  {
    id: "co-ban",
    name: "Cơ bản",
    description: "Hoàn hảo cho các tổ chức nhỏ quản lý dưới 20 nhân sự.",
    price: "250.000",
    priceVal: 250000,
    period: "/tháng",
    features: [
      "Quản lý tối đa 20 bảo vệ.",
      "Lên lịch trực ca cơ bản",
      "Check-in/Check-out ca làm"
    ],
    actionText: "Chọn gói Cơ bản",
    href: "/billing/payment/co-ban"
  },
  {
    id: "chuyen-nghiep",
    name: "Chuyên nghiệp",
    description: "Giải pháp vận hành an ninh toàn diện cho các công ty quy mô tầm trung.",
    price: "500.000",
    priceVal: 500000,
    period: "/tháng",
    features: [
      "Tất cả tính năng trong gói Cơ bản",
      "Quản lý không giới hạn mục tiêu",
      "Báo cáo phân tích chuyên sâu tự động",
      "Hệ thống trao đổi với Khách hàng"
    ],
    isPopular: true,
    actionText: "Bắt đầu dùng thử",
    href: "/billing/payment/chuyen-nghiep"
  },
  {
    id: "doanh-nghiep",
    name: "Doanh nghiệp",
    description: "Khả năng tùy chỉnh chuyên sâu và hạ tầng chuyên biệt cho quy mô lớn.",
    price: "Tùy chỉnh",
    priceVal: 1250000, // Custom monthly equivalent (1.250.000 * 12 = 15.000.000 VNĐ total)
    period: "",
    features: [
      "Máy chủ đám mây độc lập, bảo mật cao",
      "Tích hợp API kết nối hệ thống nội bộ ERP",
      "Hỗ trợ kỹ thuật 24/7 trực tiếp chuyên biệt"
    ],
    actionText: "Liên hệ tư vấn",
    href: "/billing/payment/doanh-nghiep"
  }
];
