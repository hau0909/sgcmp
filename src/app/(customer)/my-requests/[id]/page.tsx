import React, { Suspense } from "react";
import { BookingDetailContainer } from "@/features/booking/components/BookingDetailContainer";
import { BookingDetailFallback } from "@/features/booking/components/BookingDetailFallback";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RequestDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<BookingDetailFallback />}>
      <RequestDetailContent params={params} />
    </Suspense>
  );
}

async function RequestDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return <BookingDetailContainer bookingId={id} />;
}
