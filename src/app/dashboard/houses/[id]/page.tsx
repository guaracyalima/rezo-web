'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '../../../../components/layout/MainLayout';
import { HouseDetail } from '../../../../components/dashboard/houses';

export default function DashboardHouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const houseId = params.id as string;

  const handleClose = () => {
    router.push('/dashboard/houses');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <MainLayout 
      title="Detalhes da Casa"
      subtitle="Gerencie sua casa espiritual"
      currentPath="/dashboard/houses"
      user={{
        name: 'João Silva',
        email: 'joao@example.com'
      }}
      onNavigate={handleNavigate}
    >
      <HouseDetail
        houseId={houseId}
        onClose={handleClose}
        showActions={true}
      />
    </MainLayout>
  );
}