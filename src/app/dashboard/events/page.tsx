'use client';

import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { EventsManager } from '../../../components/dashboard/events';
import { useAuth } from '../../../contexts/AuthContext';

export default function DashboardEventsPage() {
  const { user } = useAuth();

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <MainLayout 
      title="Meus Eventos"
      subtitle="Gerencie e organize seus eventos espirituais"
      currentPath="/dashboard/events"
      onNavigate={handleNavigate}
    >
      <EventsManager 
        userId={user?.uid}
        showOwnerActions={true}
      />
    </MainLayout>
  );
}