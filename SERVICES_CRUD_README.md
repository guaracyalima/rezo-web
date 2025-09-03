# Atendimentos CRUD Implementation

- **`/dashboard/atendimentos`** - Dashboard atendimentos management (authenticated users)
- **`/atendimentos`** - Public atendimentos listing
- **`/atendimentos/[id]`** - Public atendimento detail view
- **`/dashboard/atendimentos/[id]`** - Dashboard atendimento detail with edit actions
- **`/test-atendimentos`** - Test page to verify components are working

## Usage Examples

### For Dashboard (Owner View)
```tsx
import { AtendimentosManager } from '../components/dashboard/atendimentos';

const DashboardPage = () => {
  const currentUserId = 'user-id'; // from auth context
  return (
    <AtendimentosManager 
      userId={currentUserId}
      showOwnerActions={true}
    />
  );
};
```

### For Public Listing
```tsx
import { AtendimentosManager } from '../components/dashboard/atendimentos';

const PublicAtendimentosPage = () => {
  return (
    <AtendimentosManager 
      showOwnerActions={false}
    />
  );
};
```

### Individual Components
```tsx
import { AtendimentoForm, AtendimentoList, AtendimentoDetail } from '../components/dashboard/atendimentos';

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

## Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Atendimentos collection
    match /atendimentos/{atendimentoId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == resource.data.providerId;
      allow update: if request.auth != null && request.auth.uid == resource.data.providerId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.providerId;
    }
  }
}
```

## Dependencies Required

Make sure to install these dependencies:

```bash
npm install firebase
npm install react
npm install @types/react (if using TypeScript)
```

## Component Architecture

### Core Components

- **AtendimentosManager**: Main container component for managing atendimentos
- **AtendimentoForm**: Form for creating/editing atendimentos
- **AtendimentoCard**: Card component for displaying atendimento preview
- **AtendimentoDetail**: Detailed view component for individual atendimento
- **AtendimentoList**: List view component for multiple atendimentos

### Supporting Components

- **AtendimentoFilters**: Filtering and search functionality
- **AtendimentoShare**: Social sharing functionality
- **AtendimentoBooking**: Booking/scheduling functionality
- **AtendimentoReviews**: Review and rating system

## Data Structure

### Atendimento Document Structure

```typescript
interface Atendimento {
  id: string;
  title: string;
  shortDescription?: string;
  description: string;
  category: string;
  basePrice: number;
  duration: number; // in minutes
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  isOnline: boolean;
  isInPerson: boolean;
  allowBooking: boolean;
  requiresApproval: boolean;
  isActive: boolean;
  isFeatured: boolean;
  maxParticipants?: number;
  images: string[];
  houseId: string;
  providerId: string;
  tags?: string[];
  languages?: string[];
  requirements?: string[];
  whatToExpect?: string[];
  includedMaterials?: string[];
  location?: {
    address?: string;
    city?: string;
    state?: string;
    isFlexible: boolean;
  };
  cancellationPolicy?: string;
  refundPolicy?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Firestore Collections

- **atendimentos**: Main collection for atendimento documents
- **houses**: House documents (referenced by atendimento.houseId)
- **users**: User documents (referenced by atendimento.providerId)

## API Functions

### Core CRUD Operations

```typescript
// Create new atendimento
const newAtendimento = await createAtendimento(atendimentoData);

// Get atendimento by ID
const atendimento = await getAtendimento(atendimentoId);

// Update atendimento
const updatedAtendimento = await updateAtendimento(atendimentoId, updateData);

// Delete atendimento
await deleteAtendimento(atendimentoId);

// Get atendimentos by provider
const providerAtendimentos = await getAtendimentosByProvider(providerId);

// Get atendimentos by house
const houseAtendimentos = await getAtendimentosByHouse(houseId);

// Get public atendimentos with filters
const { atendimentos, total } = await getAtendimentos(filters);
```

### Image Management

```typescript
// Upload atendimento image
const imageUrl = await uploadAtendimentoImage(file, atendimentoId);

// Delete atendimento image
await deleteAtendimentoImage(imageUrl);
```

### Categories and Filters

```typescript
// Get available categories
const categories = await getAtendimentoCategories();

// Get atendimentos with advanced filters
const filteredAtendimentos = await getAtendimentos({
  category: 'Consulta Espiritual',
  priceMin: 50,
  priceMax: 200,
  isOnline: true,
  experienceLevel: 'intermediate'
});
```

## File Structure

```
src/
├── components/
│   ├── dashboard/
│   │   └── atendimentos/
│   │       ├── AtendimentosManager.tsx
│   │       ├── AtendimentoForm.tsx
│   │       ├── AtendimentoCard.tsx
│   │       ├── AtendimentoDetail.tsx
│   │       └── AtendimentoList.tsx
│   └── services/
│       ├── ServiceShare.tsx
│       └── ServiceBooking.tsx
├── services/
│   └── atendimentosService.ts
├── types/
│   └── atendimento.ts
└── app/
    ├── dashboard/
    │   └── atendimentos/
    │       ├── page.tsx
    │       └── [id]/
    │           └── page.tsx
    └── atendimentos/
        ├── page.tsx
        └── [id]/
            └── page.tsx
```

## Features Implemented

### ✅ **Atendimentos Management System - Complete!**

### **🔧 1. Atendimentos Service (`atendimentosService.ts`)**
- ✅ **Complete CRUD operations** for atendimento management
- ✅ **Image upload and management** with Firebase Storage
- ✅ **Advanced filtering and search** capabilities
- ✅ **Category management** system
- ✅ **Provider and house association** functionality
- ✅ **Active/inactive status** management
- ✅ **Featured atendimento** promotion system

### **📅 2. Atendimentos Dashboard (`/dashboard/atendimentos`)**
- ✅ **Complete atendimento management** interface
- ✅ **Create, edit, delete** atendimento operations
- ✅ **Image gallery** with upload functionality
- ✅ **Category and filter** system
- ✅ **Bulk operations** support
- ✅ **Real-time updates** and notifications
- ✅ **Responsive design** for all devices

### **🎯 3. Public Atendimentos Listing (`/atendimentos`)**
- ✅ **Advanced search and filtering** by category, price, location
- ✅ **Atendimento cards** with key information
- ✅ **Detailed atendimento pages** with booking options
- ✅ **Provider profiles** integration
- ✅ **Review and rating** system
- ✅ **Social sharing** functionality
- ✅ **SEO optimization** for search engines

### **📱 4. Atendimento Detail View**
- ✅ **Comprehensive atendimento information** display
- ✅ **Image gallery** with zoom functionality
- ✅ **Booking system** integration
- ✅ **Provider contact** information
- ✅ **Related atendimentos** suggestions
- ✅ **Print-friendly** layout
- ✅ **Mobile-optimized** interface

### **🏗️ 5. Key Features:**

**Advanced Management:**
- Multiple image uploads with drag-and-drop
- Rich text descriptions with formatting
- Category-based organization
- Price and duration management
- Online/in-person modality options
- Custom requirements and expectations

**User Experience:**
- Intuitive dashboard interface
- Real-time form validation
- Progress indicators for uploads
- Toast notifications for actions
- Responsive grid and list views
- Advanced search filters

**Business Logic:**
- Provider verification system
- Atendimento approval workflow
- Commission and fee management
- Analytics and reporting
- Customer communication tools

**Technical Implementation:**
- Firebase Firestore integration
- Firebase Storage for images
- Real-time data synchronization
- Optimized queries and caching
- Error handling and recovery
- TypeScript type safety

The system now provides complete atendimento management with professional features for both providers and customers! 🎉