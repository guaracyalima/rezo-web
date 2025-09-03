// Houses Routes Documentation
// 
// This file documents the suggested routing structure for the Houses CRUD functionality.
// You'll need to install and configure React Router to implement these routes.
//
// Installation: npm install react-router-dom @types/react-router-dom
//
// Suggested Route Structure:
//
// ## Dashboard Routes (Authenticated Users)
// - /dashboard/houses              -> HousesManager (showOwnerActions=true)
// - /dashboard/houses/new          -> HouseForm (isEdit=false) 
// - /dashboard/houses/:id/edit     -> HouseForm (isEdit=true)
// - /dashboard/houses/:id          -> HouseDetail (showActions=true)
//
// ## Public Routes
// - /houses                        -> HousesManager (showOwnerActions=false)
// - /houses/:id                    -> HouseDetail (showActions=false)
// - /houses/search                 -> HousesManager with search filters
//
// ## Usage Example with React Router:
//
// ```tsx
// import { Routes, Route } from 'react-router-dom';
// import { HousesManager, HouseForm, HouseDetail } from '../components/dashboard/houses';
//
// const AppRoutes = () => (
//   <Routes>
//     {/* Dashboard Routes */}
//     <Route path="/dashboard/houses" element={<HousesManager showOwnerActions={true} />} />
//     
//     {/* Public Routes */}
//     <Route path="/houses" element={<HousesManager showOwnerActions={false} />} />
//     <Route path="/houses/:id" element={<PublicHouseDetailPage />} />
//   </Routes>
// );
// ```
//
// The HousesManager component handles internal navigation between create/edit/detail views,
// so you can use a single route per context (dashboard vs public) if preferred.

export const HOUSE_ROUTES = {
  // Dashboard routes
  DASHBOARD_HOUSES: '/dashboard/houses',
  DASHBOARD_HOUSE_NEW: '/dashboard/houses/new', 
  DASHBOARD_HOUSE_EDIT: '/dashboard/houses/:id/edit',
  DASHBOARD_HOUSE_DETAIL: '/dashboard/houses/:id',
  
  // Public routes  
  PUBLIC_HOUSES: '/houses',
  PUBLIC_HOUSE_DETAIL: '/houses/:id',
  PUBLIC_HOUSES_SEARCH: '/houses/search'
} as const;