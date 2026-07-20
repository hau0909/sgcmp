import React, { Suspense } from "react";
import { VerificationDetailWrapper } from "@/features/verification/components/VerificationDetailWrapper";
import { VerificationDetailFallback } from "@/features/verification/components/VerificationDetailFallback";

interface PageProps {
  params: Promise<{ id: string }>;
}


export default function CompanyVerificationDetailPage({
  params,
}: PageProps) {
  return (
    <Suspense fallback={<VerificationDetailFallback />}>
      <VerificationDetailContent params={params} />
    </Suspense>
  );
}

async function VerificationDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VerificationDetailWrapper id={id} />;
}
