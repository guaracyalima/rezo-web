// Availability Service - manages time slots and prevents double booking
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '../app/lib/firebase';

export interface WeeklyTimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime: string; // HH:MM
  available: boolean;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  dayName: string; // 'Seg', 'Ter', etc.
  displayDate: string; // '28/11'
}

export interface DayAvailability {
  dayOfWeek: number;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isActive: boolean;
}

// Get current week dates (Monday to Sunday)
export const getCurrentWeekDates = (): Date[] => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const monday = new Date(today);
  
  // Adjust to get Monday of current week
  const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  monday.setDate(today.getDate() + daysToMonday);
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date);
  }
  
  return weekDates;
};

// Get existing bookings for the week
export const getWeekBookings = async (serviceId: string, houseId: string): Promise<any[]> => {
  const weekDates = getCurrentWeekDates();
  const startOfWeek = new Date(weekDates[0]);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(weekDates[6]);
  endOfWeek.setHours(23, 59, 59, 999);
  
  console.log('🗓️ Fetching bookings for week:', {
    startOfWeek: startOfWeek.toISOString(),
    endOfWeek: endOfWeek.toISOString(),
    serviceId,
    houseId
  });

  try {
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('serviceId', '==', serviceId),
      where('houseId', '==', houseId),
      where('status', 'in', ['pending', 'confirmed']),
      where('scheduledDate', '>=', Timestamp.fromDate(startOfWeek)),
      where('scheduledDate', '<=', Timestamp.fromDate(endOfWeek)),
      orderBy('scheduledDate', 'asc')
    );

    const snapshot = await getDocs(bookingsQuery);
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledDate: doc.data().scheduledDate.toDate()
    }));

    console.log('📅 Found existing bookings:', bookings.length);
    return bookings;
  } catch (error) {
    console.error('❌ Error fetching week bookings:', error);
    return [];
  }
};

// Generate available time slots for the current week
export const getAvailableTimeSlotsForWeek = async (
  serviceId: string,
  houseId: string,
  serviceDuration: number = 60 // minutes
): Promise<WeeklyTimeSlot[]> => {
  console.log('🕐 Generating time slots for service:', { serviceId, houseId, serviceDuration });

  // Default availability (can be made configurable later)
  const defaultAvailability: DayAvailability[] = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true }, // Friday
    { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isActive: true }, // Saturday
    { dayOfWeek: 0, startTime: '10:00', endTime: '16:00', isActive: false }, // Sunday - disabled
  ];

  const weekDates = getCurrentWeekDates();
  const existingBookings = await getWeekBookings(serviceId, houseId);
  
  const allSlots: WeeklyTimeSlot[] = [];

  weekDates.forEach(date => {
    const dayOfWeek = date.getDay();
    const availability = defaultAvailability.find(av => av.dayOfWeek === dayOfWeek);
    
    if (!availability || !availability.isActive) {
      return; // Skip inactive days
    }

    // Don't show past dates/times
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return; // Skip past dates
    }

    const dateStr = date.toISOString().split('T')[0];
    const slots = generateDaySlots(
      date,
      availability,
      serviceDuration,
      existingBookings,
      now
    );
    
    allSlots.push(...slots);
  });

  console.log('✅ Generated time slots:', allSlots.length);
  return allSlots.filter(slot => slot.available);
};

// Generate time slots for a specific day
const generateDaySlots = (
  date: Date,
  availability: DayAvailability,
  serviceDuration: number,
  existingBookings: any[],
  now: Date
): WeeklyTimeSlot[] => {
  const slots: WeeklyTimeSlot[] = [];
  const dateStr = date.toISOString().split('T')[0];
  const isToday = dateStr === now.toISOString().split('T')[0];
  
  // Convert time strings to minutes
  const startMinutes = timeStringToMinutes(availability.startTime);
  const endMinutes = timeStringToMinutes(availability.endTime);
  
  // Generate slots every 30 minutes
  const slotInterval = 30;
  
  for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += slotInterval) {
    const slotTime = minutesToTimeString(minutes);
    const slotEndTime = minutesToTimeString(minutes + serviceDuration);
    
    // Skip past times for today
    if (isToday) {
      const slotDateTime = new Date(date);
      const [hours, mins] = slotTime.split(':').map(Number);
      slotDateTime.setHours(hours, mins, 0, 0);
      
      // Add 2 hour buffer for booking
      const bufferTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
      if (slotDateTime <= bufferTime) {
        continue;
      }
    }
    
    // Check if slot conflicts with existing bookings
    const hasConflict = existingBookings.some(booking => {
      const bookingDate = booking.scheduledDate.toISOString().split('T')[0];
      if (bookingDate !== dateStr) {
        return false;
      }
      
      const bookingStart = timeStringToMinutes(booking.scheduledTime);
      const bookingEnd = timeStringToMinutes(booking.endTime);
      
      return (minutes < bookingEnd && minutes + serviceDuration > bookingStart);
    });
    
    slots.push({
      date: dateStr,
      time: slotTime,
      endTime: slotEndTime,
      available: !hasConflict,
      dayOfWeek: date.getDay(),
      dayName: getDayName(date.getDay()),
      displayDate: formatDateForDisplay(dateStr)
    });
  }
  
  return slots;
};

// Helper functions
const timeStringToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Get day name in Portuguese
export const getDayName = (dayOfWeek: number): string => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[dayOfWeek];
};

// Format date for display
export const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
};