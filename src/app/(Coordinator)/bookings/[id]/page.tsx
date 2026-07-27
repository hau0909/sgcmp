"use client";

import React, { Suspense } from "react";
import { BookingDetailContainer } from "@/features/booking/components/BookingDetailContainer";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CoordinatorBookingDetailPage({ params }: PageProps) {
  const { dict } = useTranslation();

  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[70vh]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-sm text-on-surface-variant font-medium">
            {dict.common?.loading || "Đang tải chi tiết yêu cầu..."}
          </p>
        </div>
      }
    >
      <BookingDetailContent params={params} />
    </Suspense>
  );
}

async function BookingDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return <BookingDetailContainer bookingId={id} />;
}
