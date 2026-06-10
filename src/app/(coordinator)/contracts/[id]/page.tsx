import React from "react";
import { ContractDetailContainer } from "@/features/contract/components/ContractDetailContainer";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContractDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const contractId = resolvedParams.id;

  return <ContractDetailContainer contractId={contractId} />;
}
