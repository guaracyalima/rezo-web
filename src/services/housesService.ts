import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
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
import { rezosDb as db, storage, auth } from '../app/lib/firebase';

// TypeScript interfaces based on the houses collection schema
export interface Leader {
  name: string;
  photo?: string;
  bio: string;
  contact: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
}

export interface House {
  id?: string;
  logo?: string;
  gallery?: string[];
  name: string;
  leader: Leader;
  phone: string;
  whatsapp?: string;
  accessibility?: string;
  street: string;
  neighborhood: string;
  number: string;
  complement?: string;
  zipCode: string;
  city: string;
  state: string;
  location: Location;
  about: string;
  socialMedia?: SocialMedia;
  cult: string;
  owner: string;
  approved: boolean;
  deleted: boolean;
  responsibles: string[];
  notificationTemplate?: string;
  enabledShop: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CreateHouseData extends Omit<House, 'id' | 'owner' | 'approved' | 'deleted' | 'createdAt' | 'updatedAt'> {}

export interface UpdateHouseData extends Partial<Omit<House, 'id' | 'owner' | 'createdAt'>> {}

export interface HouseFilters {
  cult?: string;
  city?: string;
  state?: string;
  searchTerm?: string;
  approved?: boolean;
  deleted?: boolean;
}

export interface PaginationOptions {
  limitCount?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

const HOUSES_COLLECTION = 'houses';

// Create a new house
export const createHouse = async (houseData: CreateHouseData): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create a house');
    }

    const newHouse: Omit<House, 'id'> = {
      ...houseData,
      owner: user.uid,
      approved: true, // MVP: Auto-approve all houses
      deleted: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, HOUSES_COLLECTION), newHouse);
    return docRef.id;
  } catch (error) {
    console.error('Error creating house:', error);
    throw error;
  }
};

// Get a house by ID
export const getHouseById = async (houseId: string): Promise<House | null> => {
  try {
    const docRef = doc(db, HOUSES_COLLECTION, houseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as House;
    }
    return null;
  } catch (error) {
    console.error('Error getting house:', error);
    throw error;
  }
};

// Update a house
export const updateHouse = async (houseId: string, updateData: UpdateHouseData): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update a house');
    }

    // Get current house to check permissions
    const currentHouse = await getHouseById(houseId);
    if (!currentHouse) {
      throw new Error('House not found');
    }

    // Check if user is owner or responsible
    if (currentHouse.owner !== user.uid && !currentHouse.responsibles.includes(user.uid)) {
      throw new Error('User not authorized to update this house');
    }

    // Only owner can update responsibles and enabledShop
    if (currentHouse.owner !== user.uid) {
      if (updateData.responsibles !== undefined || updateData.enabledShop !== undefined) {
        throw new Error('Only the owner can update responsibles or enabledShop');
      }
    }

    const docRef = doc(db, HOUSES_COLLECTION, houseId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating house:', error);
    throw error;
  }
};

// Soft delete a house (only owner can delete)
export const deleteHouse = async (houseId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete a house');
    }

    // Get current house to check permissions
    const currentHouse = await getHouseById(houseId);
    if (!currentHouse) {
      throw new Error('House not found');
    }

    // Only owner can delete
    if (currentHouse.owner !== user.uid) {
      throw new Error('Only the owner can delete a house');
    }

    const docRef = doc(db, HOUSES_COLLECTION, houseId);
    await updateDoc(docRef, {
      deleted: true,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error deleting house:', error);
    throw error;
  }
};

// Get houses with filters and pagination
export const getHouses = async (
  filters: HouseFilters = {},
  pagination: PaginationOptions = {}
): Promise<{ houses: House[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> => {
  try {
    const { 
      cult, 
      city, 
      state, 
      searchTerm, 
      approved = true, 
      deleted = false 
    } = filters;
    
    const { limitCount = 20, lastDoc } = pagination;

    console.log('getHouses called with filters:', filters);

    let q = query(
      collection(db, HOUSES_COLLECTION),
      where('deleted', '==', deleted)
    );

    // Add filters only if they have values
    if (approved !== undefined) {
      q = query(q, where('approved', '==', approved));
    }

    if (cult && cult.trim()) {
      q = query(q, where('cult', '==', cult.trim()));
    }

    if (city && city.trim()) {
      q = query(q, where('city', '==', city.trim()));
    }

    if (state && state.trim()) {
      q = query(q, where('state', '==', state.trim()));
    }

    // Add ordering and pagination
    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('Firestore returned', querySnapshot.docs.length, 'documents');
    
    let houses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as House[];

    // Client-side search filter for searchTerm (name, about, leader name)
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      houses = houses.filter(house => 
        house.name.toLowerCase().includes(searchLower) ||
        house.about.toLowerCase().includes(searchLower) ||
        house.leader.name.toLowerCase().includes(searchLower) ||
        house.cult.toLowerCase().includes(searchLower)
      );
    }

    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];

    console.log('Returning', houses.length, 'houses after filtering');
    return {
      houses,
      lastDoc: lastDocument
    };
  } catch (error) {
    console.error('Error getting houses:', error);
    throw error;
  }
};

// Get houses by owner
export const getHousesByOwner = async (ownerId?: string): Promise<House[]> => {
  try {
    const userId = ownerId || auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User ID required');
    }

    const q = query(
      collection(db, HOUSES_COLLECTION),
      where('owner', '==', userId),
      where('deleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as House[];
  } catch (error) {
    console.error('Error getting houses by owner:', error);
    throw error;
  }
};

// Get houses where user is responsible
export const getHousesByResponsible = async (userId?: string): Promise<House[]> => {
  try {
    const currentUserId = userId || auth.currentUser?.uid;
    if (!currentUserId) {
      throw new Error('User ID required');
    }

    const q = query(
      collection(db, HOUSES_COLLECTION),
      where('responsibles', 'array-contains', currentUserId),
      where('deleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as House[];
  } catch (error) {
    console.error('Error getting houses by responsible:', error);
    throw error;
  }
};

// Add responsible to house (only owner)
export const addResponsible = async (houseId: string, responsibleId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const currentHouse = await getHouseById(houseId);
    if (!currentHouse) {
      throw new Error('House not found');
    }

    if (currentHouse.owner !== user.uid) {
      throw new Error('Only the owner can add responsibles');
    }

    if (currentHouse.responsibles.includes(responsibleId)) {
      throw new Error('User is already a responsible');
    }

    const docRef = doc(db, HOUSES_COLLECTION, houseId);
    await updateDoc(docRef, {
      responsibles: [...currentHouse.responsibles, responsibleId],
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding responsible:', error);
    throw error;
  }
};

// Remove responsible from house (only owner)
export const removeResponsible = async (houseId: string, responsibleId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const currentHouse = await getHouseById(houseId);
    if (!currentHouse) {
      throw new Error('House not found');
    }

    if (currentHouse.owner !== user.uid) {
      throw new Error('Only the owner can remove responsibles');
    }

    const docRef = doc(db, HOUSES_COLLECTION, houseId);
    await updateDoc(docRef, {
      responsibles: currentHouse.responsibles.filter(id => id !== responsibleId),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error removing responsible:', error);
    throw error;
  }
};

// Upload image to Firebase Storage
export const uploadHouseImage = async (
  file: File, 
  houseId: string, 
  type: 'logo' | 'gallery'
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const fileName = `${type}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `houses/${houseId}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete image from Firebase Storage
export const deleteHouseImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Get available cults (for dropdown)
export const getAvailableCults = (): string[] => {
  return [
    'Santo Daime',
    'Xamanismo',
    'Barquinha',
    'Umbanda',
    'Jurema',
    'Quimbanda',
    'Candomblé',
    'Tambor de Mina',
    'Práticas Indígenas',
    'Outro'
  ];
};

// Get available Brazilian states
export const getBrazilianStates = (): string[] => {
  return [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
};