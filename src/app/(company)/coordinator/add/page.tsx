import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddCoordinatorForm } from "@/features/coordinator/components/AddCoordinatorForm";

export default function AddCoordinatorPage() {
  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4">
        <Link
          href="/coordinator"
          className="inline-flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors w-fit mb-1"
        >
          <ArrowLeft className="w-[15px] h-[15px]" />
          Quay lại danh sách
        </Link>
        <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
          Thêm mới Điều phối viên
        </h2>
        <p className="text-sm text-on-surface-variant mt-0.5 font-body">
          Điền đầy đủ thông tin để tạo tài khoản điều phối viên mới cho doanh nghiệp.
        </p>
      </div>

      {/* Form */}
      <AddCoordinatorForm />

      <div className="h-8" />
    </div>
  );
}
