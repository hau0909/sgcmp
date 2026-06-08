"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-red-600">
        Không có quyền truy cập
      </h1>

      <p className="mt-4 max-w-md text-gray-600">
        Tài khoản của bạn không có quyền truy cập vào trang này hoặc tài khoản
        chưa được kích hoạt.
      </p>

      <button
        type="button"
        onClick={handleGoBack}
        className="mt-6 rounded-full bg-primary px-6 py-2 font-semibold text-white transition hover:opacity-90"
      >
        Quay lại trang trước
      </button>
    </main>
  );
}
