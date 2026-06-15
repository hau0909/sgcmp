"use client";

import React from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import Header from "@/components/layout/Header";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleGuard allowedRoles={["customer"]}>
      <div className="min-h-screen bg-surface text-on-surface antialiased">
        <Header />
        <main className="pt-28 pb-12">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
