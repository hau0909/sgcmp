"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignInComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log({
      email,
      password,
    });

    // TODO: gọi hàm login Supabase ở đây
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-6">
      <div className="w-full max-w-[430px] rounded-md border border-slate-300 bg-white px-7 py-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">SGCMP</h1>
          <p className="mt-3 text-sm text-slate-700">
            Điền thông tin của bạn để truy cập hệ thống
          </p>
        </div>

        <form onSubmit={handleSignIn} className="mt-7 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Địa chỉ Email
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded border border-slate-300 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-900">
                Mật khẩu
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-800 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded border border-slate-300 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />
          </div>

          <button
            type="submit"
            className="mt-2 h-10 w-full rounded cursor-pointer bg-blue-800 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            Đăng nhập
          </button>

          <Link
            href="/register
            "
            className="flex h-10 w-full items-center justify-center rounded border border-blue-800 bg-white text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
          >
            Đăng ký
          </Link>
        </form>
      </div>
    </div>
  );
}
