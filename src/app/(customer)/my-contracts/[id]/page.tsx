import { CustomerContractDetailContainer } from "@/features/contract/components/CustomerContractDetailContainer";

interface ContractDetailPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;
}

export default async function CustomerContractDetailPage({
  params,
}: ContractDetailPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto w-full px-6 space-y-5">
      <CustomerContractDetailContainer contractId={id} />
    </div>
  );
}
