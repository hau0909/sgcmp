"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    console.log({
      fullName,
      email,
      phone,
      password,
    });

    // TODO: gọi hàm register Supabase ở đây
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-10">
      <div className="w-full max-w-[500px] rounded-md border border-slate-300 bg-white px-12 py-12 shadow-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-800">SGCMP</h1>

          <h2 className="mt-5 text-3xl font-bold text-slate-950">
            Tạo tài khoản mới
          </h2>

          <p className="mt-3 text-lg text-slate-700">
            Điền thông tin của bạn để truy cập hệ thống
          </p>
        </div>

        <form onSubmit={handleSignUp} className="mt-10 space-y-6">
          <div>
            <label className="mb-2 block text-base font-semibold text-slate-950">
              Họ và tên
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 w-full rounded border border-slate-300 px-4 text-lg outline-none transition placeholder:text-slate-500 focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-950">
              Địa chỉ Email
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded border border-slate-300 px-4 text-lg outline-none transition placeholder:text-slate-500 focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-950">
              Số điện thoại
            </label>
            <input
              type="tel"
              placeholder="+84 000 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 w-full rounded border border-slate-300 px-4 text-lg outline-none transition placeholder:text-slate-500 focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-950">
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded border border-slate-300 px-4 text-lg outline-none transition placeholder:text-slate-500 focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-950">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 w-full rounded border border-slate-300 px-4 text-lg outline-none transition placeholder:text-slate-500 focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-8 h-12 w-full rounded bg-blue-800 text-base font-semibold text-white transition hover:bg-blue-900"
          >
            Đăng ký
          </button>

          <div className="pt-4">
            <div className="border-t border-slate-300" />
          </div>

          <div className="text-center text-base text-slate-700">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-800 hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
