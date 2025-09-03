# Houses CRUD Implementation

This directory contains the complete CRUD (Create, Read, Update, Delete) implementation for the houses collection in the Rezo Web platform.

## File Structure

```
src/
├── services/
│   └── housesService.ts          # Core service with Firestore operations
├── components/dashboard/houses/
│   ├── HouseForm.tsx            # Form for creating/editing houses
│   ├── HouseList.tsx            # List component with filters and pagination
│   ├── HouseDetail.tsx          # Detailed view of a house
│   ├── HousesManager.tsx        # Main orchestrator component
│   └── index.ts                 # Export file
├── config/
│   └── firebase.ts              # Firebase configuration
└── examples/
    └── HousesExamples.tsx       # Usage examples
```

## Components Overview

### 1. HousesService (`services/housesService.ts`)
Core service providing all CRUD operations:
- **createHouse()** - Create a new house
- **getHouseById()** - Get house by ID
- **updateHouse()** - Update house data
- **deleteHouse()** - Soft delete (sets deleted: true)
- **getHouses()** - Get houses with filters and pagination
- **getHousesByOwner()** - Get houses owned by user
- **getHousesByResponsible()** - Get houses where user is responsible
- **addResponsible()** / **removeResponsible()** - Manage responsibles
- **uploadHouseImage()** / **deleteHouseImage()** - Image management

### 2. HouseForm (`components/dashboard/houses/HouseForm.tsx`)
Comprehensive form for creating and editing houses:
- All fields from the houses schema
- File uploads for logo, leader photo, and gallery
- Validation and error handling
- Support for both create and edit modes

### 3. HouseList (`components/dashboard/houses/HouseList.tsx`)
List component with advanced features:
- Search and filtering (cult, city, state, search term)
- Pagination with "load more" functionality
- Owner/public views with different actions
- Responsive card layout

### 4. HouseDetail (`components/dashboard/houses/HouseDetail.tsx`)
Detailed house view:
- Image gallery with thumbnails
- Complete house information display
- Leader profile section
- Contact and location information
- Social media links
- Quick action buttons

### 5. HousesManager (`components/dashboard/houses/HousesManager.tsx`)
Main orchestrator component:
- Manages navigation between different views
- Handles success/error messages
- Coordinates CRUD operations
- Provides unified interface

## Features Implemented

### ✅ Core CRUD Operations
- Create new houses with all required fields
- Read houses with filtering and pagination
- Update existing houses (with permission checks)
- Soft delete houses (owner only)

### ✅ Advanced Features
- Image upload and management (Firebase Storage)
- Multiple image gallery support
- Owner/responsible permission system
- Search and filtering
- Pagination
- Responsive design
- Error handling

### ✅ Security
- Firebase authentication integration
- Permission-based operations (owner/responsible)
- Firestore security rules compatible
- Input validation

### ✅ User Experience
- Loading states
- Success/error messages
- Responsive design
- Image previews
- Character counters for text fields

## Database Configuration

⚠️ **Important**: This application uses the **"rezos"** database, not the default Firestore database.

### Authentication & User Management
- **Authentication Service**: `src/services/authService.ts`
- **Database**: Users are stored in `rezos/users` collection
- **Auth Context**: `src/contexts/AuthContext.tsx` manages global auth state

### Houses CRUD
- **Houses Service**: `src/services/housesService.ts`  
- **Database**: Houses are stored in `rezos/houses` collection
- **Owner Permissions**: Only authenticated users can create/edit their houses

## Next.js App Router Implementation

The following pages have been created for Next.js App Router:

### Created Files:
- `src/app/dashboard/houses/page.tsx` - Dashboard houses management
- `src/app/dashboard/houses/[id]/page.tsx` - Dashboard house detail
- `src/app/houses/page.tsx` - Public houses listing  
- `src/app/houses/[id]/page.tsx` - Public house detail
- `src/app/test-houses/page.tsx` - Test page to verify routing

### Available Routes:
- **`/dashboard/houses`** - Dashboard houses management (authenticated users)
- **`/houses`** - Public houses listing
- **`/houses/[id]`** - Public house detail view
- **`/dashboard/houses/[id]`** - Dashboard house detail with edit actions
- **`/test-houses`** - Test page to verify components are working

## Usage Examples

### For Dashboard (Owner View)
```tsx
import { HousesManager } from '../components/dashboard/houses';

const DashboardPage = () => {
  const currentUserId = 'user-id'; // from auth context
  
  return (
    <HousesManager 
      userId={currentUserId}
      showOwnerActions={true}
    />
  );
};
```

### For Public Listing
```tsx
import { HousesManager } from '../components/dashboard/houses';

const PublicHousesPage = () => {
  return (
    <HousesManager 
      showOwnerActions={false}
    />
  );
};
```

### Individual Components
```tsx
import { HouseForm, HouseList, HouseDetail } from '../components/dashboard/houses';

// Use individual components for custom layouts
```

## Firebase Configuration

Update `src/config/firebase.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Dependencies Required

Make sure to install these dependencies:

```bash
npm install firebase
npm install react
npm install @types/react (if using TypeScript)
```

## Firestore Security Rules

The implementation is compatible with the Firestore security rules defined in the project README. Make sure to implement those rules in your Firebase console.

## Schema Compliance

All components strictly follow the houses collection schema defined in the project documentation:
- All required fields are validated
- Character limits are enforced
- Image limits are respected (logo + 5 gallery images)
- Permission system matches the schema requirements

## Next Steps

1. Add authentication context integration
2. Add routing integration (React Router)
3. Add toast notifications library
4. Implement Google Maps integration for location
5. Add unit tests
6. Add error boundary components