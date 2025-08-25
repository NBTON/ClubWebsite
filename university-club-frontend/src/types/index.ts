export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  organizerId: string;
  organizerName: string;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  imageUrl?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registrationTime: Date;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  reason?: string;
  notes?: string;
  attendance?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'organizer' | 'admin';
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    emailNotifications: boolean;
    eventReminders: boolean;
  };
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number;
  tags: string[];
  imageUrl?: string;
}

export interface RegistrationFormData {
  reason?: string;
}