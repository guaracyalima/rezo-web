export interface Atendimento {
  id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: boolean;
  deletedAt?: Date;
}

export interface CreateAtendimentoData {
  title: string;
  shortDescription?: string;
  description: string;
  category: string;
  basePrice: number;
  duration: number;
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
}

export interface AtendimentoFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  isOnline?: boolean;
  isInPerson?: boolean;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  isActive?: boolean;
  isFeatured?: boolean;
  providerId?: string;
  houseId?: string;
  searchQuery?: string;
  tags?: string[];
  languages?: string[];
  deleted?: boolean;
}