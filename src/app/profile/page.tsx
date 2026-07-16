"use client";

import React from "react";
import ProfileForm from "@/features/profile/components/ProfileForm";
import Header from "@/components/layout/Header";
import RoleGuard from "@/components/auth/RoleGuard";
import { UserCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <RoleGuard allowedRoles={["customer", "guard", "coordinator", "admin", "company-admin"]}>
      <div className="min-h-screen bg-surface text-on-surface antialiased">
        <Header />
        <main className="pt-28 pb-12 max-w-7xl mx-auto w-full px-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <UserCircle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary tracking-tight font-headline">
                  Hồ sơ cá nhân
                </h1>
                <p className="text-sm text-on-surface-variant mt-0.5 font-body">
                  Xem và cập nhật thông tin cá nhân của bạn.
                </p>
              </div>
            </div>
          </div>

          <ProfileForm />
        </main>
      </div>
    </RoleGuard>
  );
}
