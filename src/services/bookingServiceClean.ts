import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../app/lib/firebase';

// Collections
const bookingsCollection = collection(db, 'bookings');

export interface Booking {
  id?: string;
  serviceId: string;
  providerId: string;
  customerId: string;
  houseId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceTitle: string;
  servicePrice: number;
  serviceDuration: number; // in minutes
  isOnline: boolean;
  isInPerson: boolean;
  
  // Scheduling
  scheduledDate: Date;
  scheduledTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
  
  // Payment
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentAmount: number;
  platformFee: number; // 10% commission
  paymentId?: string;
  stripeSessionId?: string;
  
  // Online meeting (Jitsi)
  meetingRoomId?: string;
  meetingPassword?: string;
  meetingUrl?: string;
  
  // Location (for in-person)
  location?: {
    address: string;
    city: string;
    state: string;
    complement?: string;
    instructions?: string;
  };
  
  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  cancellationReason?: string;
  cancellationPolicy?: string;
  refundPolicy?: string;
  
  // Calendar integration
  googleEventId?: string;
  calendarReminders: boolean;
  
  // Notes
  customerNotes?: string;
  providerNotes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
}

export interface CreateBookingData extends Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> {}

// Create a new booking
export const createBooking = async (bookingData: CreateBookingData): Promise<string> => {
  try {
    console.log('Creating booking with data:', bookingData);
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create a booking');
    }

    // Clean data to remove undefined values
    const cleanBookingData: any = {
      serviceId: bookingData.serviceId,
      providerId: bookingData.providerId,
      customerId: user.uid,
      houseId: bookingData.houseId,
      customerName: bookingData.customerName || user.displayName || user.email || '',
      customerEmail: bookingData.customerEmail || user.email || '',
      customerPhone: bookingData.customerPhone || '',
      serviceTitle: bookingData.serviceTitle,
      servicePrice: bookingData.servicePrice,
      serviceDuration: bookingData.serviceDuration,
      isOnline: bookingData.isOnline,
      isInPerson: bookingData.isInPerson,
      scheduledDate: Timestamp.fromDate(bookingData.scheduledDate),
      scheduledTime: bookingData.scheduledTime,
      endTime: bookingData.endTime,
      timezone: bookingData.timezone || 'America/Sao_Paulo',
      paymentStatus: bookingData.paymentStatus || 'pending',
      paymentAmount: bookingData.paymentAmount,
      platformFee: bookingData.platformFee,
      status: bookingData.status || 'pending',
      calendarReminders: bookingData.calendarReminders || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Only add location if it has valid data
    if (bookingData.location && typeof bookingData.location === 'object') {
      const cleanLocation: any = {};
      if (bookingData.location.address) cleanLocation.address = bookingData.location.address;
      if (bookingData.location.city) cleanLocation.city = bookingData.location.city;
      if (bookingData.location.state) cleanLocation.state = bookingData.location.state;
      if (bookingData.location.complement) cleanLocation.complement = bookingData.location.complement;
      if (bookingData.location.instructions) cleanLocation.instructions = bookingData.location.instructions;
      
      if (Object.keys(cleanLocation).length > 0) {
        cleanBookingData.location = cleanLocation;
      }
    }

    // Only add optional fields if they have values
    if (bookingData.customerNotes?.trim()) {
      cleanBookingData.customerNotes = bookingData.customerNotes.trim();
    }

    if (bookingData.providerNotes?.trim()) {
      cleanBookingData.providerNotes = bookingData.providerNotes.trim();
    }

    console.log('Clean booking data to be saved:', cleanBookingData);

    const docRef = await addDoc(bookingsCollection, cleanBookingData);
    console.log('Booking created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error('Failed to create booking');
  }
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string, 
  status: Booking['status'],
  additionalData?: Partial<Booking>
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
      ...additionalData
    };

    if (status === 'confirmed') {
      updateData.confirmedAt = Timestamp.now();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = Timestamp.now();
    } else if (status === 'completed') {
      updateData.completedAt = Timestamp.now();
    }

    await updateDoc(doc(db, 'bookings', bookingId), updateData);
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status');
  }
};

// Get bookings for a provider
export const getProviderBookings = async (
  providerId: string,
  status?: Booking['status']
): Promise<Booking[]> => {
  try {
    let bookingsQuery = query(
      collection(db, 'bookings'),
      where('providerId', '==', providerId),
      orderBy('scheduledDate', 'desc')
    );

    if (status) {
      bookingsQuery = query(
        collection(db, 'bookings'),
        where('providerId', '==', providerId),
        where('status', '==', status),
        orderBy('scheduledDate', 'desc')
      );
    }

    const snapshot = await getDocs(bookingsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      scheduledDate: doc.data().scheduledDate.toDate(),
      confirmedAt: doc.data().confirmedAt?.toDate(),
      cancelledAt: doc.data().cancelledAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate()
    })) as Booking[];
  } catch (error) {
    console.error('Error getting provider bookings:', error);
    throw new Error('Failed to get provider bookings');
  }
};

// Get customer bookings
export const getCustomerBookings = async (customerId: string): Promise<Booking[]> => {
  try {
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('customerId', '==', customerId),
      orderBy('scheduledDate', 'desc')
    );

    const snapshot = await getDocs(bookingsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      scheduledDate: doc.data().scheduledDate.toDate(),
      confirmedAt: doc.data().confirmedAt?.toDate(),
      cancelledAt: doc.data().cancelledAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate()
    })) as Booking[];
  } catch (error) {
    console.error('Error getting customer bookings:', error);
    throw new Error('Failed to get customer bookings');
  }
};

// Generate Jitsi meeting room for online services
export const generateJitsiRoom = (bookingId: string): {
  roomId: string;
  password: string;
  url: string;
} => {
  const roomId = `rezo-${bookingId}-${Date.now()}`;
  const password = Math.random().toString(36).substring(2, 10);
  const url = `https://meet.jit.si/${roomId}#config.startWithVideoMuted=true&config.startWithAudioMuted=true`;
  
  return { roomId, password, url };
};

// Cancel booking
export const cancelBooking = async (
  bookingId: string,
  reason: string,
  refund: boolean = false
): Promise<void> => {
  try {
    const updateData: any = {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    if (refund) {
      updateData.paymentStatus = 'refunded';
    }

    await updateDoc(doc(db, 'bookings', bookingId), updateData);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw new Error('Failed to cancel booking');
  }
};

// Get booking by ID
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'bookings', bookingId));
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      scheduledDate: data.scheduledDate.toDate(),
      confirmedAt: data.confirmedAt?.toDate(),
      cancelledAt: data.cancelledAt?.toDate(),
      completedAt: data.completedAt?.toDate()
    } as Booking;
  } catch (error) {
    console.error('Error getting booking by ID:', error);
    throw new Error('Failed to get booking');
  }
};