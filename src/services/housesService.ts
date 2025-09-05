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
import { User } from 'firebase/auth';
import { rezosDb as db, storage, auth } from '../app/lib/firebase';

// TypeScript interfaces based on the houses collection schema
export interface Leader {
  name: string;
  contact: string; // email
  cpf: string;
  mobilePhone: string;
  address: string;
  addressNumber: string;
  complement?: string;
  province: string; // bairro
  postalCode: string;
  birthDate: string;
}

export interface Location {
  address: string;
  addressNumber: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
}

export interface House {
  id: string;
  name: string;
  description?: string;
  ownerId: string; // Corrigido: era owner
  responsibles: string[]; // Adicionado campo responsibles
  leader: Leader;
  location: Location;
  logo?: string;
  gallery?: string[];
  socialMedia?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  accessibility?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  cult?: string;
  about?: string;
  businessDocument?: string;
  companyType?: string;
  mobilePhone?: string;
  incomeValue?: number;
  allowBookings?: boolean;
  allowShop?: boolean;
  allowEvents?: boolean;
  enabledShop?: boolean; // Adicionado campo enabledShop
  approved: boolean;
  deleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateHouseData {
  name: string;
  description?: string;
  shortDescription?: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  website?: string;
  
  leader: Leader;
  location: Location;
  
  // Business options
  allowBookings?: boolean;
  allowEvents?: boolean;
  allowShop?: boolean;
  
  // Business info
  businessDocument?: string;
  companyType?: 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION';
  incomeValue?: number;
  
  // Visual
  logo?: string;
  images?: string[];
  
  // Meta
  tags?: string[];
  isPublic?: boolean;
  requiresApproval?: boolean;
}

export interface UpdateHouseData extends Partial<Omit<House, 'id' | 'ownerId' | 'createdAt'>> {
  responsibles?: string[];
  enabledShop?: boolean;
}

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
// Função para verificar email duplicado
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, HOUSES_COLLECTION),
      where('leader.contact', '==', email),
      where('deleted', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};

// Função para verificar CPF/CNPJ duplicado
export const checkDocumentExists = async (document: string): Promise<boolean> => {
  try {
    console.log("cabeca d eminha pica 2");
    const cleanDocument = document.replace(/[^\d]/g, ''); // Remove máscaras
    const q = query(
      collection(db, HOUSES_COLLECTION),
      where('businessDocument', '==', cleanDocument)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking document:', error);
    return false;
  }
};

export const createHouse = async (houseData: CreateHouseData): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create a house');
    }

    // Verificar se email já está cadastrado
    if (houseData.email) {
      const emailExists = await checkEmailExists(houseData.email);
      if (emailExists) {
        throw new Error('Este email já está sendo utilizado por outra casa.');
      }
    }

    // Verificar se documento já está cadastrado
    if (houseData.businessDocument) {
      const documentExists = await checkDocumentExists(houseData.businessDocument);
      if (documentExists) {
        throw new Error('Este CPF/CNPJ já está sendo utilizado por outra casa.');
      }
    }

    const newHouse: House = {
      ...houseData,
      ownerId: user.uid, // Corrigindo: usar o ID do usuário autenticado
      responsibles: [], // Array vazio inicialmente
      id: '', // Will be set after creation
      approved: houseData.allowBookings || houseData.allowShop || houseData.allowEvents ? true : false,
      deleted: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Remove id temporarily for creation
    const { id, ...houseWithoutId } = newHouse;
    
    const docRef = await addDoc(collection(db, HOUSES_COLLECTION), houseWithoutId);
    console.log('House created with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating house:', error);
    throw new Error('Failed to create house');
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
    if (currentHouse.ownerId !== user.uid && !currentHouse.responsibles.includes(user.uid)) {
      throw new Error('You do not have permission to update this house');
    }

    // Only owner can update certain fields
    if (currentHouse.ownerId !== user.uid) {
      if (updateData.responsibles !== undefined || updateData.enabledShop !== undefined) {
        throw new Error('Only the house owner can update responsibles or shop settings');
      }
    }    const docRef = doc(db, HOUSES_COLLECTION, houseId);
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
    if (currentHouse.ownerId !== user.uid) {
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
        house.about?.toLowerCase().includes(searchLower) ||
        house.leader.name.toLowerCase().includes(searchLower) ||
        house.cult?.toLowerCase().includes(searchLower)
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
      where('ownerId', '==', userId),
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

    if (currentHouse.ownerId !== user.uid) {
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

    if (currentHouse.ownerId !== user.uid) {
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

// Function to create wallet
export const createHouseWallet = async (houseId: string, houseData: CreateHouseData, userId: string) => {
  const walletData = {
    houseId: houseId,
    leader: {
      name: houseData.leader.name,
      contact: houseData.leader.contact,
      cpf: houseData.leader.cpf || houseData.businessDocument,
      incomeValue: houseData.incomeValue || 1500,
      mobilePhone: houseData.leader.mobilePhone,
      address: houseData.leader.address,
      addressNumber: houseData.leader.addressNumber,
      complement: houseData.leader.complement || '',
      province: houseData.leader.province,
      postalCode: houseData.leader.postalCode,
      companyType: houseData.companyType || '',
      birthDate: houseData.leader.birthDate
    },
    auth: {
      uid: userId
    }
  };

  const response = await fetch('https://primary-production-9acc.up.railway.app/webhook/onboarding-owner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'rhouse_token': '$2a$12$38YmZFfquehxyDuDFijj4.dYY1WOWF3m5UZz8uKAQMuwOE2ma5KpK'
    },
    body: JSON.stringify(walletData)
  });

  if (!response.ok) {
    throw new Error(`Failed to create wallet: ${response.statusText}`);
  }

  return response.json();
};