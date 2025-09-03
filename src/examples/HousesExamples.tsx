import React from 'react';
import { HousesManager } from '../components/dashboard/houses';

// Example usage for a dashboard page
const DashboardHousesPage: React.FC = () => {
  // Get current user ID (replace with actual auth context)
  const currentUserId = 'current-user-id'; // This should come from your auth context

  return (
    <div>
      <HousesManager 
        userId={currentUserId}
        showOwnerActions={true}
      />
    </div>
  );
};

// Example usage for a public houses listing page
const PublicHousesPage: React.FC = () => {
  return (
    <div>
      <HousesManager 
        showOwnerActions={false}
      />
    </div>
  );
};

export { DashboardHousesPage, PublicHousesPage };