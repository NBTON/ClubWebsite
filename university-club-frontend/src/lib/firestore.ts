import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Event, Registration, UserProfile } from '@/types';

// Convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Convert Event document to Event object
const docToEvent = (doc: QueryDocumentSnapshot): Event => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    date: timestampToDate(data.date),
    location: data.location,
    maxAttendees: data.maxAttendees,
    currentAttendees: data.currentAttendees,
    organizerId: data.organizerId,
    organizerName: data.organizerName,
    status: data.status,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    tags: data.tags || [],
    imageUrl: data.imageUrl
  };
};

// Convert Registration document to Registration object
const docToRegistration = (doc: QueryDocumentSnapshot): Registration => {
  const data = doc.data();
  return {
    id: doc.id,
    eventId: data.eventId,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    registrationTime: timestampToDate(data.registrationTime),
    status: data.status,
    reason: data.reason,
    notes: data.notes,
    attendance: data.attendance
  };
};

// Events API
export const eventsApi = {
  // Get all active events with pagination
  async getEvents(lastDoc?: DocumentSnapshot, pageSize: number = 10): Promise<{ events: Event[], lastDoc?: DocumentSnapshot }> {
    try {
      let eventsQuery = query(
        collection(db, 'events'),
        where('status', '==', 'active'),
        orderBy('date', 'asc'),
        limit(pageSize)
      );

      if (lastDoc) {
        eventsQuery = query(eventsQuery, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(eventsQuery);
      const events = querySnapshot.docs.map(docToEvent);

      const newLastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : undefined;

      return { events, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get single event by ID
  async getEvent(eventId: string): Promise<Event | null> {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        return docToEvent(eventDoc as QueryDocumentSnapshot);
      }
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Create new event
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentAttendees'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        date: Timestamp.fromDate(eventData.date),
        currentAttendees: 0,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update event
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    try {
      const updateData: any = { ...updates, updatedAt: Timestamp.now() };

      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      await updateDoc(doc(db, 'events', eventId), updateData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete event
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
};

// Registrations API
export const registrationsApi = {
  // Get registrations for an event
  async getEventRegistrations(eventId: string): Promise<Registration[]> {
    try {
      const q = query(
        collection(db, 'registrations'),
        where('eventId', '==', eventId),
        orderBy('registrationTime', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(docToRegistration);
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      throw error;
    }
  },

  // Get user's registrations
  async getUserRegistrations(userId: string): Promise<Registration[]> {
    try {
      const q = query(
        collection(db, 'registrations'),
        where('userId', '==', userId),
        orderBy('registrationTime', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(docToRegistration);
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      throw error;
    }
  },

  // Register for an event
  async registerForEvent(eventId: string, userId: string, userName: string, userEmail: string, reason?: string): Promise<string> {
    try {
      // Check if user is already registered
      const existingQuery = query(
        collection(db, 'registrations'),
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      );

      const existingDocs = await getDocs(existingQuery);
      if (!existingDocs.empty) {
        throw new Error('Already registered for this event');
      }

      const docRef = await addDoc(collection(db, 'registrations'), {
        eventId,
        userId,
        userName,
        userEmail,
        registrationTime: Timestamp.now(),
        status: 'confirmed',
        reason: reason || null
      });

      // Update event attendee count
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        await updateDoc(doc(db, 'events', eventId), {
          currentAttendees: eventData.currentAttendees + 1,
          updatedAt: Timestamp.now()
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  // Cancel registration
  async cancelRegistration(registrationId: string, eventId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'registrations', registrationId), {
        status: 'cancelled'
      });

      // Update event attendee count
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        await updateDoc(doc(db, 'events', eventId), {
          currentAttendees: Math.max(0, eventData.currentAttendees - 1),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
      throw error;
    }
  }
};