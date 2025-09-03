// Atendimentos Service
// Handles all atendimento-related operations with Firebase

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../app/lib/firebase';

// TypeScript interfaces for Services
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ServiceSession {
  id: string;
  duration: number; // in minutes
  price: number;
  description?: string;
  isPopular?: boolean;
}

export interface ServiceAvailability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export interface Service {
  id?: string;
  title: string;
  description: string;
  shortDescription?: string;
  houseId: string; // Reference to the house offering the service
  providerId: string; // User who created the service
  category: string;
  subcategory?: string;
  basePrice: number;
  sessions?: ServiceSession[];
  images: string[];
  tags?: string[];
  isOnline: boolean;
  isInPerson: boolean;
  maxParticipants?: number;
  requirements?: string[];
  whatToExpect?: string[];
  includedMaterials?: string[];
  availability?: ServiceAvailability[];
  languages?: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration: number; // Default duration in minutes
  location?: {
    address?: string;
    city?: string;
    state?: string;
    isFlexible?: boolean;
  };
  isActive: boolean;
  isFeatured: boolean;
  allowBooking: boolean;
  requiresApproval: boolean;
  cancellationPolicy?: string;
  refundPolicy?: string;
  metaTitle?: string;
  metaDescription?: string;
  seoSlug?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  deleted: boolean;
}

export interface CreateServiceData extends Omit<Service, 'id' | 'providerId' | 'isActive' | 'createdAt' | 'updatedAt' | 'deleted'> {}

export interface UpdateServiceData extends Partial<Omit<Service, 'id' | 'providerId' | 'createdAt'>> {}

export interface ServiceFilters {
  category?: string;
  subcategory?: string;
  houseId?: string;
  providerId?: string;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isOnline?: boolean;
  isInPerson?: boolean;
  experienceLevel?: string;
  deleted?: boolean;
  tags?: string[];
  languages?: string[];
  city?: string;
  state?: string;
}

export interface ServicePaginationOptions {
  limitCount?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

const servicesCollection = collection(db, 'services');

console.log('Firebase services collection initialized:', servicesCollection);
console.log('Firebase auth:', auth);
console.log('Firebase db:', db);

// Test function to verify Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test reading from services collection
    const q = query(servicesCollection, limit(1));
    const querySnapshot = await getDocs(q);
    
    console.log('Firebase connection test successful!');
    console.log('Services collection accessible:', querySnapshot.size >= 0);
    console.log('Current user:', auth.currentUser);
    
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};

// Debug function to check raw Firebase data
export const debugFirebaseData = async () => {
  try {
    console.log('🔍 DEBUG: Checking raw Firebase data...');
    
    // Check if Firebase is initialized
    console.log('📱 Firebase auth:', auth);
    console.log('💾 Firebase db:', db);
    console.log('📂 Services collection:', servicesCollection);
    
    // Try the most basic query possible
    console.log('🔬 Testing basic getDocs...');
    const allDocs = await getDocs(servicesCollection);
    console.log('📊 Total documents in collection:', allDocs.size);
    
    if (allDocs.size === 0) {
      console.log('❌ Collection is empty or doesn\'t exist');
      return [];
    }
    
    const allServices: any[] = [];
    allDocs.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Document ID:', doc.id);
      console.log('📝 Document data:', data);
      allServices.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('✅ All services found:', allServices);
    return allServices;
  } catch (error) {
    console.error('💥 Debug function failed:', error);
    throw error;
  }
};

// Create a new service
export const createService = async (serviceData: CreateServiceData): Promise<string> => {
  try {
    console.log('Creating service with data:', serviceData);
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create a service');
    }

    console.log('Current user:', user.uid);

    // Clean data to remove undefined values
    const cleanServiceData: any = {
      title: serviceData.title,
      description: serviceData.description,
      houseId: serviceData.houseId,
      providerId: user.uid,
      category: serviceData.category,
      basePrice: serviceData.basePrice,
      duration: serviceData.duration,
      experienceLevel: serviceData.experienceLevel,
      isOnline: serviceData.isOnline,
      isInPerson: serviceData.isInPerson,
      images: serviceData.images || [],
      isActive: true,
      isFeatured: serviceData.isFeatured || false,
      allowBooking: serviceData.allowBooking !== false,
      requiresApproval: serviceData.requiresApproval || false,
      deleted: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    console.log('Clean service data to be saved:', cleanServiceData);

    // Add optional fields only if they have values
    if (serviceData.shortDescription) {
      cleanServiceData.shortDescription = serviceData.shortDescription;
    }

    if (serviceData.subcategory) {
      cleanServiceData.subcategory = serviceData.subcategory;
    }

    if (serviceData.sessions && serviceData.sessions.length > 0) {
      cleanServiceData.sessions = serviceData.sessions;
    }

    if (serviceData.tags && serviceData.tags.length > 0) {
      cleanServiceData.tags = serviceData.tags;
    }

    if (serviceData.maxParticipants) {
      cleanServiceData.maxParticipants = serviceData.maxParticipants;
    }

    if (serviceData.requirements && serviceData.requirements.length > 0) {
      cleanServiceData.requirements = serviceData.requirements;
    }

    if (serviceData.whatToExpect && serviceData.whatToExpect.length > 0) {
      cleanServiceData.whatToExpect = serviceData.whatToExpect;
    }

    if (serviceData.includedMaterials && serviceData.includedMaterials.length > 0) {
      cleanServiceData.includedMaterials = serviceData.includedMaterials;
    }

    if (serviceData.availability && serviceData.availability.length > 0) {
      cleanServiceData.availability = serviceData.availability;
    }

    if (serviceData.languages && serviceData.languages.length > 0) {
      cleanServiceData.languages = serviceData.languages;
    }

    if (serviceData.location) {
      cleanServiceData.location = serviceData.location;
    }

    if (serviceData.cancellationPolicy) {
      cleanServiceData.cancellationPolicy = serviceData.cancellationPolicy;
    }

    if (serviceData.refundPolicy) {
      cleanServiceData.refundPolicy = serviceData.refundPolicy;
    }

    if (serviceData.metaTitle) {
      cleanServiceData.metaTitle = serviceData.metaTitle;
    }

    if (serviceData.metaDescription) {
      cleanServiceData.metaDescription = serviceData.metaDescription;
    }

    if (serviceData.seoSlug) {
      cleanServiceData.seoSlug = serviceData.seoSlug;
    }

    const docRef = await addDoc(servicesCollection, cleanServiceData);
    console.log('Service created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Get a service by ID
export const getServiceById = async (serviceId: string): Promise<Service | null> => {
  try {
    const docRef = doc(servicesCollection, serviceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Service;
    }
    return null;
  } catch (error) {
    console.error('Error getting service:', error);
    throw error;
  }
};

// Update a service
export const updateService = async (serviceId: string, updateData: UpdateServiceData): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update a service');
    }

    // Get current service to check permissions
    const currentService = await getServiceById(serviceId);
    if (!currentService) {
      throw new Error('Service not found');
    }

    // Check if user is provider or house owner
    if (currentService.providerId !== user.uid) {
      // TODO: Also check if user is house owner/responsible
      throw new Error('User not authorized to update this service');
    }

    // Clean update data to remove undefined values
    const cleanUpdateData: any = {
      updatedAt: Timestamp.now()
    };

    // Add only defined values
    Object.keys(updateData).forEach(key => {
      const value = (updateData as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanUpdateData[key] = value;
      }
    });

    const docRef = doc(servicesCollection, serviceId);
    await updateDoc(docRef, cleanUpdateData);
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

// Soft delete a service
export const deleteService = async (serviceId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete a service');
    }

    const currentService = await getServiceById(serviceId);
    if (!currentService) {
      throw new Error('Service not found');
    }

    if (currentService.providerId !== user.uid) {
      throw new Error('Only the provider can delete a service');
    }

    const docRef = doc(servicesCollection, serviceId);
    await updateDoc(docRef, {
      deleted: true,
      isActive: false,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Get services with filters and pagination - FIXED VERSION
export const getServices = async (
  filters: ServiceFilters = {},
  pagination: ServicePaginationOptions = {}
): Promise<{ services: Service[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> => {
  try {
    console.log('🔍 getServices called with filters:', filters);
    console.log('🔍 Pagination options:', pagination);
    
    const { 
      category, 
      subcategory, 
      houseId,
      providerId,
      priceMin,
      priceMax,
      isActive,
      isFeatured,
      isOnline,
      isInPerson,
      experienceLevel,
      deleted,
      tags,
      languages,
      city,
      state
    } = filters;
    
    const { limitCount = 20, lastDoc } = pagination;

    // STEP 1: First, test if we can access the collection at all
    console.log('🧪 Testing basic collection access...');
    try {
      const testQuery = query(servicesCollection, limit(3));
      const testSnapshot = await getDocs(testQuery);
      console.log('✅ Collection accessible! Found', testSnapshot.size, 'documents');
      testSnapshot.docs.forEach((doc, index) => {
        console.log(`📄 Document ${index + 1}:`, doc.id, doc.data());
      });
    } catch (testError) {
      console.error('❌ Cannot access services collection:', testError);
      throw new Error('Não foi possível acessar a coleção de serviços');
    }

    // STEP 2: Build query based on filters
    console.log('🔧 Building query...');
    
    let queryConstraints: any[] = [];
    
    // Only add constraints if the corresponding fields exist in our documents
    const hasNoFilters = Object.keys(filters).length === 0;
    
    if (hasNoFilters) {
      // For public area with no filters, show everything
      console.log('📊 No filters applied - showing all services');
      queryConstraints = [limit(limitCount)];
    } else {
      // Apply filters gradually
      if (deleted !== undefined) {
        queryConstraints.push(where('deleted', '==', deleted));
        console.log('🗑️ Added deleted filter:', deleted);
      } else {
        // Default: exclude deleted items only if deleted field exists
        // We'll test this in a try-catch
      }
      
      if (isActive !== undefined) {
        queryConstraints.push(where('isActive', '==', isActive));
        console.log('✅ Added isActive filter:', isActive);
      }
      
      if (category && category.trim()) {
        queryConstraints.push(where('category', '==', category.trim()));
        console.log('🏷️ Added category filter:', category);
      }
      
      if (houseId && houseId.trim()) {
        queryConstraints.push(where('houseId', '==', houseId.trim()));
        console.log('🏠 Added houseId filter:', houseId);
      }
      
      if (providerId && providerId.trim()) {
        queryConstraints.push(where('providerId', '==', providerId.trim()));
        console.log('👤 Added providerId filter:', providerId);
      }
      
      if (isFeatured !== undefined) {
        queryConstraints.push(where('isFeatured', '==', isFeatured));
        console.log('⭐ Added isFeatured filter:', isFeatured);
      }
      
      if (isOnline !== undefined) {
        queryConstraints.push(where('isOnline', '==', isOnline));
        console.log('💻 Added isOnline filter:', isOnline);
      }
      
      if (isInPerson !== undefined) {
        queryConstraints.push(where('isInPerson', '==', isInPerson));
        console.log('👥 Added isInPerson filter:', isInPerson);
      }
      
      if (experienceLevel && experienceLevel !== 'all') {
        queryConstraints.push(where('experienceLevel', '==', experienceLevel));
        console.log('📈 Added experienceLevel filter:', experienceLevel);
      }
      
      queryConstraints.push(limit(limitCount));
    }
    
    console.log('🔗 Query constraints:', queryConstraints.length);
    
    // STEP 3: Try to add ordering if possible
    let finalQuery = query(servicesCollection, ...queryConstraints);
    
    try {
      // Try with ordering first
      if (queryConstraints.length > 1) {
        console.log('📅 Attempting to add ordering...');
        finalQuery = query(servicesCollection, ...queryConstraints, orderBy('createdAt', 'desc'));
      }
    } catch (orderError) {
      console.log('⚠️ Ordering failed, using query without orderBy');
      finalQuery = query(servicesCollection, ...queryConstraints);
    }
    
    if (lastDoc) {
      finalQuery = query(finalQuery, startAfter(lastDoc));
      console.log('📄 Added pagination startAfter');
    }

    // STEP 4: Execute the query
    console.log('🚀 Executing final query...');
    const querySnapshot = await getDocs(finalQuery);
    
    console.log('📊 Query executed successfully! Found', querySnapshot.size, 'documents');
    
    let services = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    }) as Service[];

    console.log('🎯 Mapped services:', services.length);
    
    // STEP 5: Apply client-side filters for complex queries
    let filteredServices = [...services];
    
    if (priceMin !== undefined) {
      filteredServices = filteredServices.filter(service => service.basePrice >= priceMin);
      console.log('💰 After priceMin filter:', filteredServices.length);
    }

    if (priceMax !== undefined) {
      filteredServices = filteredServices.filter(service => service.basePrice <= priceMax);
      console.log('💰 After priceMax filter:', filteredServices.length);
    }

    if (tags && tags.length > 0) {
      filteredServices = filteredServices.filter(service => 
        service.tags && tags.some(tag => service.tags!.includes(tag))
      );
      console.log('🏷️ After tags filter:', filteredServices.length);
    }

    if (languages && languages.length > 0) {
      filteredServices = filteredServices.filter(service => 
        service.languages && languages.some(lang => service.languages!.includes(lang))
      );
      console.log('🗣️ After languages filter:', filteredServices.length);
    }

    if (city) {
      filteredServices = filteredServices.filter(service => 
        service.location?.city?.toLowerCase().includes(city.toLowerCase())
      );
      console.log('🏙️ After city filter:', filteredServices.length);
    }

    if (state) {
      filteredServices = filteredServices.filter(service => 
        service.location?.state?.toLowerCase().includes(state.toLowerCase())
      );
      console.log('🗺️ After state filter:', filteredServices.length);
    }

    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];

    console.log('✅ Final result:', {
      servicesCount: filteredServices.length,
      hasLastDoc: !!lastDocument
    });

    return {
      services: filteredServices,
      lastDoc: lastDocument
    };
  } catch (error) {
    console.error('❌ Error in getServices:', error);
    
    // FALLBACK: Try the most basic query possible
    try {
      console.log('🔄 Attempting fallback query...');
      const fallbackQuery = query(servicesCollection, limit(20));
      const fallbackSnapshot = await getDocs(fallbackQuery);
      
      const fallbackServices = fallbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      
      console.log('🆘 Fallback successful:', fallbackServices.length, 'services');
      
      return {
        services: fallbackServices,
        lastDoc: fallbackSnapshot.docs[fallbackSnapshot.docs.length - 1]
      };
    } catch (fallbackError) {
      console.error('💥 Fallback also failed:', fallbackError);
      throw error;
    }
  }
};

// Get services by house
export const getServicesByHouse = async (houseId: string): Promise<Service[]> => {
  try {
    console.log('Fetching services for house:', houseId);

    // First, try without any filters except houseId to see what's there
    const basicQuery = query(
      servicesCollection,
      where('houseId', '==', houseId)
    );

    const basicSnapshot = await getDocs(basicQuery);
    console.log('All services for house (no filters):', basicSnapshot.size);
    basicSnapshot.docs.forEach(doc => {
      console.log('Service data:', doc.id, doc.data());
    });

    // Now try with filters
    const q = query(
      servicesCollection,
      where('houseId', '==', houseId),
      where('deleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const services = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Service[];

    console.log('Found services for house with filters:', services.length, services);
    return services;
  } catch (error) {
    console.error('Error getting services by house:', error);
    
    // If the filtered query fails, try a simpler one
    try {
      console.log('Trying simpler query without orderBy...');
      const simpleQuery = query(
        servicesCollection,
        where('houseId', '==', houseId),
        where('deleted', '==', false)
      );
      
      const simpleSnapshot = await getDocs(simpleQuery);
      const simpleServices = simpleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      
      console.log('Simple query results:', simpleServices.length, simpleServices);
      return simpleServices;
    } catch (simpleError) {
      console.error('Simple query also failed:', simpleError);
      throw error;
    }
  }
};

// Get services by provider
export const getServicesByProvider = async (providerId?: string): Promise<Service[]> => {
  try {
    const userId = providerId || auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User ID required');
    }

    console.log('Fetching services for provider:', userId);

    const q = query(
      servicesCollection,
      where('providerId', '==', userId),
      where('deleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const services = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Service[];

    console.log('Found services for provider:', services.length, services);
    return services;
  } catch (error) {
    console.error('Error getting services by provider:', error);
    throw error;
  }
};

// Upload service image
export const uploadServiceImage = async (
  file: File, 
  serviceId: string
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const fileName = `service_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `services/${serviceId}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading service image:', error);
    throw error;
  }
};

// Delete service image
export const deleteServiceImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting service image:', error);
    throw error;
  }
};

// Get available service categories
export const getServiceCategories = (): string[] => {
  return [
    'Consulta Espiritual',
    'Leitura de Cartas',
    'Reiki',
    'Terapia Holística',
    'Meditação',
    'Aromaterapia',
    'Cristaloterapia',
    'Numerologia',
    'Astrologia',
    'Massagem Terapêutica',
    'Terapia com Florais',
    'Limpeza Espiritual',
    'Desenvolvimento Mediúnico',
    'Curso Online',
    'Workshop',
    'Mentoria',
    'Outro'
  ];
};

// Toggle service featured status
export const toggleServiceFeatured = async (serviceId: string): Promise<void> => {
  try {
    const service = await getServiceById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    await updateService(serviceId, {
      isFeatured: !service.isFeatured
    });
  } catch (error) {
    console.error('Error toggling service featured status:', error);
    throw error;
  }
};

// Toggle service active status
export const toggleServiceActive = async (serviceId: string): Promise<void> => {
  try {
    const service = await getServiceById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    await updateService(serviceId, {
      isActive: !service.isActive
    });
  } catch (error) {
    console.error('Error toggling service active status:', error);
    throw error;
  }
};