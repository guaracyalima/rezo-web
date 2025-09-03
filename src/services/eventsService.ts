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

// TypeScript interfaces for Events
export interface EventLocation {
  address: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

export interface EventTicket {
  type: string; // 'free', 'paid', 'donation'
  price?: number;
  currency?: string;
  description?: string;
}

export interface Event {
  id?: string;
  title: string;
  description: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  location: EventLocation;
  houseId: string; // Reference to the house organizing the event
  organizerId: string; // User who created the event
  category: string; // 'ceremony', 'workshop', 'gathering', 'retreat', 'other'
  maxParticipants?: number;
  currentParticipants: number;
  ticketInfo: EventTicket;
  images?: string[];
  requirements?: string; // Age restrictions, preparations, etc.
  contactInfo: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  isPublic: boolean;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  deleted: boolean;
}

export interface CreateEventData extends Omit<Event, 'id' | 'organizerId' | 'currentParticipants' | 'isActive' | 'createdAt' | 'updatedAt' | 'deleted'> {}

export interface UpdateEventData extends Partial<Omit<Event, 'id' | 'organizerId' | 'createdAt'>> {}

export interface EventFilters {
  category?: string;
  city?: string;
  state?: string;
  houseId?: string;
  startDate?: Date;
  endDate?: Date;
  isPublic?: boolean;
  isActive?: boolean;
  deleted?: boolean;
}

export interface EventPaginationOptions {
  limitCount?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

const EVENTS_COLLECTION = 'events';

// Create a new event
export const createEvent = async (eventData: CreateEventData): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create an event');
    }

    // Clean data to remove undefined values
    const cleanEventData: any = {
      title: eventData.title,
      description: eventData.description,
      startDate: eventData.startDate,
      category: eventData.category,
      houseId: eventData.houseId,
      organizerId: user.uid,
      currentParticipants: 0,
      isActive: true,
      deleted: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      location: {
        address: eventData.location.address,
        city: eventData.location.city,
        state: eventData.location.state
      },
      ticketInfo: {
        type: eventData.ticketInfo.type
      },
      contactInfo: {},
      isPublic: eventData.isPublic,
      images: eventData.images || []
    };

    // Add optional fields only if they have values
    if (eventData.endDate) {
      cleanEventData.endDate = eventData.endDate;
    }

    if (eventData.maxParticipants) {
      cleanEventData.maxParticipants = eventData.maxParticipants;
    }

    if (eventData.location.lat) {
      cleanEventData.location.lat = eventData.location.lat;
    }

    if (eventData.location.lng) {
      cleanEventData.location.lng = eventData.location.lng;
    }

    if (eventData.ticketInfo.price !== undefined) {
      cleanEventData.ticketInfo.price = eventData.ticketInfo.price;
    }

    if (eventData.ticketInfo.description) {
      cleanEventData.ticketInfo.description = eventData.ticketInfo.description;
    }

    if (eventData.contactInfo.phone) {
      cleanEventData.contactInfo.phone = eventData.contactInfo.phone;
    }

    if (eventData.contactInfo.whatsapp) {
      cleanEventData.contactInfo.whatsapp = eventData.contactInfo.whatsapp;
    }

    if (eventData.contactInfo.email) {
      cleanEventData.contactInfo.email = eventData.contactInfo.email;
    }

    if (eventData.requirements) {
      cleanEventData.requirements = eventData.requirements;
    }

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), cleanEventData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get an event by ID
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Event;
    }
    return null;
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
};

// Update an event
export const updateEvent = async (eventId: string, updateData: UpdateEventData): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update an event');
    }

    // Get current event to check permissions
    const currentEvent = await getEventById(eventId);
    if (!currentEvent) {
      throw new Error('Event not found');
    }

    // Check if user is organizer or house owner
    if (currentEvent.organizerId !== user.uid) {
      // TODO: Also check if user is house owner/responsible
      throw new Error('User not authorized to update this event');
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

    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, cleanUpdateData);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Soft delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete an event');
    }

    const currentEvent = await getEventById(eventId);
    if (!currentEvent) {
      throw new Error('Event not found');
    }

    if (currentEvent.organizerId !== user.uid) {
      throw new Error('Only the organizer can delete an event');
    }

    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      deleted: true,
      isActive: false,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get events with filters and pagination
export const getEvents = async (
  filters: EventFilters = {},
  pagination: EventPaginationOptions = {}
): Promise<{ events: Event[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> => {
  try {
    const { 
      category, 
      city, 
      state, 
      houseId,
      isPublic = true, 
      isActive = true,
      deleted = false 
    } = filters;
    
    const { limitCount = 20, lastDoc } = pagination;

    let q = query(
      collection(db, EVENTS_COLLECTION),
      where('deleted', '==', deleted)
    );

    // Add filters
    if (isActive !== undefined) {
      q = query(q, where('isActive', '==', isActive));
    }

    if (isPublic !== undefined) {
      q = query(q, where('isPublic', '==', isPublic));
    }

    if (category && category.trim()) {
      q = query(q, where('category', '==', category.trim()));
    }

    if (houseId && houseId.trim()) {
      q = query(q, where('houseId', '==', houseId.trim()));
    }

    if (city && city.trim()) {
      q = query(q, where('location.city', '==', city.trim()));
    }

    if (state && state.trim()) {
      q = query(q, where('location.state', '==', state.trim()));
    }

    // Order by start date (upcoming events first)
    q = query(q, orderBy('startDate', 'asc'), limit(limitCount));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];

    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      events,
      lastDoc: lastDocument
    };
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

// Get events by organizer
export const getEventsByOrganizer = async (organizerId?: string): Promise<Event[]> => {
  try {
    const userId = organizerId || auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User ID required');
    }

    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('organizerId', '==', userId),
      where('deleted', '==', false),
      orderBy('startDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  } catch (error) {
    console.error('Error getting events by organizer:', error);
    throw error;
  }
};

// Get events by house
export const getEventsByHouse = async (houseId: string): Promise<Event[]> => {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('houseId', '==', houseId),
      where('deleted', '==', false),
      where('isActive', '==', true),
      orderBy('startDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  } catch (error) {
    console.error('Error getting events by house:', error);
    throw error;
  }
};

// Upload event image
export const uploadEventImage = async (
  file: File, 
  eventId: string
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const fileName = `event_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `events/${eventId}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading event image:', error);
    throw error;
  }
};

// Delete event image
export const deleteEventImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting event image:', error);
    throw error;
  }
};

// Get available event categories
export const getEventCategories = (): string[] => {
  return [
    'Cerimônia',
    'Workshop',
    'Encontro',
    'Retiro',
    'Palestra',
    'Curso',
    'Celebração',
    'Meditação',
    'Outro'
  ];
};