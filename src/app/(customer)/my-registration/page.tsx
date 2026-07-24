import React from "react";
import { MyRegistrationView } from "@/features/registration";

export const metadata = {
  title: "Hồ sơ đăng ký của tôi | SGCMP",
  description: "Xem trạng thái hồ sơ đăng ký doanh nghiệp của bạn.",
};

export default function MyRegistrationPage() {
  return <MyRegistrationView />;
}
