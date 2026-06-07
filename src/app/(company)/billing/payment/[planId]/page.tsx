import PaymentScreen from "@/features/payment/component/PaymentScreen";

interface PageProps {
  params: Promise<{
    planId: string;
  }>;
}

export default async function PaymentPage({ params }: PageProps) {
  const { planId } = await params;

  return <PaymentScreen planId={planId} />;
}
