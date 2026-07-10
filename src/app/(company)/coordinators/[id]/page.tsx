import React from 'react';
import CoordinatorDetail from '@/features/coordinator/components/CoordinatorDetail';

export const metadata = {
  title: 'Chi tiết Điều phối viên | SG-CMP',
  description: 'Xem thông tin chi tiết Điều phối viên',
};

export default async function CoordinatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <CoordinatorDetail coordinatorId={resolvedParams.id} />;
}
