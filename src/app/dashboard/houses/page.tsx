'use client';

import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { HousesManager } from '../../../components/dashboard/houses';
import { useAuth } from '../../../contexts/AuthContext';

export default function DashboardHousesPage() {
  const { user, userProfile, loading } = useAuth();
  
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !userProfile) {
    window.location.href = '/login';
    return null;
  }

  return (
    <MainLayout 
      title="Minhas Casas"
      subtitle="Gerencie suas casas espirituais"
      currentPath="/dashboard/houses"
      user={{
        name: userProfile.name,
        email: userProfile.email
      }}
      onNavigate={handleNavigate}
    >
      <HousesManager 
        userId={user.uid}
        showOwnerActions={true}
      />
    </MainLayout>
  );
}