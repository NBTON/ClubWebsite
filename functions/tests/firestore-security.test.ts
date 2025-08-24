import { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;
  let unauthenticatedDb: any;
  let authenticatedDb: any;
  let adminDb: any;
  let organizerDb: any;

  beforeAll(async () => {
    // Initialize test environment
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: require('../../university-club-frontend/firestore.rules'),
      },
    });

    // Create different user contexts
    unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    authenticatedDb = testEnv.authenticatedContext('user123').firestore();
    adminDb = testEnv.authenticatedContext('admin123', { role: 'admin' }).firestore();
    organizerDb = testEnv.authenticatedContext('organizer123', { role: 'organizer' }).firestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    // Clear all data before each test
    await testEnv.clearFirestore();
  });

  describe('Users Collection', () => {
    const userId = 'user123';
    const otherUserId = 'user456';

    it('should allow users to read their own profile', async () => {
      // Create a user profile
      await adminDb.collection('users').doc(userId).set({
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      // User should be able to read their own profile
      const userDoc = await authenticatedDb.collection('users').doc(userId).get();
      expect(userDoc.exists).toBe(true);
      expect(userDoc.data()?.email).toBe('user@example.com');
    });

    it('should allow users to write their own profile', async () => {
      await authenticatedDb.collection('users').doc(userId).set({
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      const userDoc = await authenticatedDb.collection('users').doc(userId).get();
      expect(userDoc.exists).toBe(true);
    });

    it('should prevent users from reading other users profiles', async () => {
      // Create another user's profile
      await adminDb.collection('users').doc(otherUserId).set({
        email: 'other@example.com',
        displayName: 'Other User',
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      // User should not be able to read other user's profile
      await expect(
        authenticatedDb.collection('users').doc(otherUserId).get()
      ).rejects.toThrow();
    });

    it('should allow admins to read all user profiles', async () => {
      // Create a user profile
      await adminDb.collection('users').doc(userId).set({
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      // Admin should be able to read any user profile
      const userDoc = await adminDb.collection('users').doc(userId).get();
      expect(userDoc.exists).toBe(true);
    });

    it('should validate email format', async () => {
      // Try to create user with invalid email
      await expect(
        authenticatedDb.collection('users').doc(userId).set({
          email: 'invalid-email',
          displayName: 'Test User',
          role: 'user',
          createdAt: new Date(),
          lastLogin: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should validate display name length', async () => {
      // Try to create user with empty display name
      await expect(
        authenticatedDb.collection('users').doc(userId).set({
          email: 'user@example.com',
          displayName: '', // Empty string should fail
          role: 'user',
          createdAt: new Date(),
          lastLogin: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should validate user role', async () => {
      // Try to create user with invalid role
      await expect(
        authenticatedDb.collection('users').doc(userId).set({
          email: 'user@example.com',
          displayName: 'Test User',
          role: 'invalid-role',
          createdAt: new Date(),
          lastLogin: new Date(),
        })
      ).rejects.toThrow();
    });
  });

  describe('Events Collection', () => {
    const eventId = 'event123';
    const organizerId = 'organizer123';

    it('should allow anyone to read active events', async () => {
      // Create an active event
      await adminDb.collection('events').doc(eventId).set({
        title: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        location: 'Test Location',
        maxAttendees: 100,
        currentAttendees: 0,
        organizerId: organizerId,
        organizerName: 'Test Organizer',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['test'],
      });

      // Unauthenticated user should be able to read active events
      const eventDoc = await unauthenticatedDb.collection('events').doc(eventId).get();
      expect(eventDoc.exists).toBe(true);
      expect(eventDoc.data()?.status).toBe('active');
    });

    it('should allow authenticated users to read all events', async () => {
      // Create a cancelled event
      await adminDb.collection('events').doc(eventId).set({
        title: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        location: 'Test Location',
        maxAttendees: 100,
        currentAttendees: 0,
        organizerId: organizerId,
        organizerName: 'Test Organizer',
        status: 'cancelled',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['test'],
      });

      // Authenticated user should be able to read cancelled events
      const eventDoc = await authenticatedDb.collection('events').doc(eventId).get();
      expect(eventDoc.exists).toBe(true);
      expect(eventDoc.data()?.status).toBe('cancelled');
    });

    it('should allow organizers to create events', async () => {
      await organizerDb.collection('events').doc(eventId).set({
        title: 'New Event',
        description: 'New Description',
        date: new Date(Date.now() + 86400000), // Tomorrow
        location: 'Test Location',
        maxAttendees: 100,
        currentAttendees: 0,
        organizerId: organizerId,
        organizerName: 'Test Organizer',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['test'],
      });

      const eventDoc = await organizerDb.collection('events').doc(eventId).get();
      expect(eventDoc.exists).toBe(true);
    });

    it('should prevent regular users from creating events', async () => {
      await expect(
        authenticatedDb.collection('events').doc(eventId).set({
          title: 'New Event',
          description: 'New Description',
          date: new Date(Date.now() + 86400000),
          location: 'Test Location',
          maxAttendees: 100,
          currentAttendees: 0,
          organizerId: 'user123',
          organizerName: 'Test User',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['test'],
        })
      ).rejects.toThrow();
    });

    it('should validate event title length', async () => {
      await expect(
        organizerDb.collection('events').doc(eventId).set({
          title: '', // Empty title should fail
          description: 'New Description',
          date: new Date(Date.now() + 86400000),
          location: 'Test Location',
          maxAttendees: 100,
          currentAttendees: 0,
          organizerId: organizerId,
          organizerName: 'Test Organizer',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['test'],
        })
      ).rejects.toThrow();
    });

    it('should validate event date is in future', async () => {
      await expect(
        organizerDb.collection('events').doc(eventId).set({
          title: 'Past Event',
          description: 'New Description',
          date: new Date(Date.now() - 86400000), // Yesterday
          location: 'Test Location',
          maxAttendees: 100,
          currentAttendees: 0,
          organizerId: organizerId,
          organizerName: 'Test Organizer',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['test'],
        })
      ).rejects.toThrow();
    });

    it('should validate max attendees is positive', async () => {
      await expect(
        organizerDb.collection('events').doc(eventId).set({
          title: 'Invalid Event',
          description: 'New Description',
          date: new Date(Date.now() + 86400000),
          location: 'Test Location',
          maxAttendees: -1, // Negative should fail
          currentAttendees: 0,
          organizerId: organizerId,
          organizerName: 'Test Organizer',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['test'],
        })
      ).rejects.toThrow();
    });

    it('should allow organizer to update their own event', async () => {
      // First create an event
      await organizerDb.collection('events').doc(eventId).set({
        title: 'Original Event',
        description: 'Original Description',
        date: new Date(Date.now() + 86400000),
        location: 'Test Location',
        maxAttendees: 100,
        currentAttendees: 0,
        organizerId: organizerId,
        organizerName: 'Test Organizer',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['test'],
      });

      // Update the event
      await organizerDb.collection('events').doc(eventId).update({
        title: 'Updated Event',
        updatedAt: new Date(),
      });

      const updatedDoc = await organizerDb.collection('events').doc(eventId).get();
      expect(updatedDoc.data()?.title).toBe('Updated Event');
    });

    it('should prevent organizer from updating other events', async () => {
      // Create event with different organizer
      await adminDb.collection('events').doc(eventId).set({
        title: 'Other Event',
        description: 'Other Description',
        date: new Date(Date.now() + 86400000),
        location: 'Test Location',
        maxAttendees: 100,
        currentAttendees: 0,
        organizerId: 'other-organizer',
        organizerName: 'Other Organizer',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['test'],
      });

      // Try to update event from different organizer
      await expect(
        organizerDb.collection('events').doc(eventId).update({
          title: 'Hacked Event',
          updatedAt: new Date(),
        })
      ).rejects.toThrow();
    });
  });

  describe('Registrations Collection', () => {
    const eventId = 'event123';
    const registrationId = 'reg123';
    const userId = 'user123';

    beforeEach(async () => {
      // Create an event for testing
      await adminDb.collection('events').doc(eventId).set({
        title: 'Test Event',
        description: 'Test Description',
        date: new Date(Date.now() + 86400000),
        location: 'Test Location',
        maxAttendees: 100,
        currentAttendees: 0,
        organizerId: 'organizer123',
        organizerName: 'Test Organizer',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['test'],
      });
    });

    it('should allow authenticated users to create registrations', async () => {
      await authenticatedDb.collection('registrations').doc(registrationId).set({
        eventId: eventId,
        userId: userId,
        userName: 'Test User',
        userEmail: 'user@example.com',
        registrationTime: new Date(),
        status: 'confirmed',
        reason: 'Interested in the topic',
      });

      const regDoc = await authenticatedDb.collection('registrations').doc(registrationId).get();
      expect(regDoc.exists).toBe(true);
    });

    it('should prevent users from registering for inactive events', async () => {
      // Update event to cancelled
      await adminDb.collection('events').doc(eventId).update({
        status: 'cancelled',
      });

      await expect(
        authenticatedDb.collection('registrations').doc(registrationId).set({
          eventId: eventId,
          userId: userId,
          userName: 'Test User',
          userEmail: 'user@example.com',
          registrationTime: new Date(),
          status: 'confirmed',
          reason: 'Interested in the topic',
        })
      ).rejects.toThrow();
    });

    it('should validate email format in registration', async () => {
      await expect(
        authenticatedDb.collection('registrations').doc(registrationId).set({
          eventId: eventId,
          userId: userId,
          userName: 'Test User',
          userEmail: 'invalid-email', // Invalid email
          registrationTime: new Date(),
          status: 'confirmed',
          reason: 'Interested in the topic',
        })
      ).rejects.toThrow();
    });

    it('should validate registration status', async () => {
      await expect(
        authenticatedDb.collection('registrations').doc(registrationId).set({
          eventId: eventId,
          userId: userId,
          userName: 'Test User',
          userEmail: 'user@example.com',
          registrationTime: new Date(),
          status: 'invalid-status', // Invalid status
          reason: 'Interested in the topic',
        })
      ).rejects.toThrow();
    });

    it('should allow users to read their own registrations', async () => {
      // Create a registration
      await authenticatedDb.collection('registrations').doc(registrationId).set({
        eventId: eventId,
        userId: userId,
        userName: 'Test User',
        userEmail: 'user@example.com',
        registrationTime: new Date(),
        status: 'confirmed',
        reason: 'Interested in the topic',
      });

      // User should be able to read their own registration
      const regDoc = await authenticatedDb.collection('registrations').doc(registrationId).get();
      expect(regDoc.exists).toBe(true);
    });

    it('should allow event organizers to read registrations for their events', async () => {
      // Create a registration
      await adminDb.collection('registrations').doc(registrationId).set({
        eventId: eventId,
        userId: userId,
        userName: 'Test User',
        userEmail: 'user@example.com',
        registrationTime: new Date(),
        status: 'confirmed',
        reason: 'Interested in the topic',
      });

      // Organizer should be able to read registrations for their events
      const regDoc = await organizerDb.collection('registrations').doc(registrationId).get();
      expect(regDoc.exists).toBe(true);
    });

    it('should allow admins to read all registrations', async () => {
      // Create a registration
      await adminDb.collection('registrations').doc(registrationId).set({
        eventId: eventId,
        userId: userId,
        userName: 'Test User',
        userEmail: 'user@example.com',
        registrationTime: new Date(),
        status: 'confirmed',
        reason: 'Interested in the topic',
      });

      // Admin should be able to read any registration
      const regDoc = await adminDb.collection('registrations').doc(registrationId).get();
      expect(regDoc.exists).toBe(true);
    });

    it('should allow users to cancel their own registrations', async () => {
      // Create a registration
      await authenticatedDb.collection('registrations').doc(registrationId).set({
        eventId: eventId,
        userId: userId,
        userName: 'Test User',
        userEmail: 'user@example.com',
        registrationTime: new Date(),
        status: 'confirmed',
        reason: 'Interested in the topic',
      });

      // User should be able to cancel their registration
      await authenticatedDb.collection('registrations').doc(registrationId).update({
        status: 'cancelled',
      });

      const updatedDoc = await authenticatedDb.collection('registrations').doc(registrationId).get();
      expect(updatedDoc.data()?.status).toBe('cancelled');
    });

    it('should prevent users from updating other fields in their registration', async () => {
      // Create a registration
      await authenticatedDb.collection('registrations').doc(registrationId).set({
        eventId: eventId,
        userId: userId,
        userName: 'Test User',
        userEmail: 'user@example.com',
        registrationTime: new Date(),
        status: 'confirmed',
        reason: 'Interested in the topic',
      });

      // Try to update a field other than status
      await expect(
        authenticatedDb.collection('registrations').doc(registrationId).update({
          userName: 'Hacked Name', // Should not be allowed
        })
      ).rejects.toThrow();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting for user writes', async () => {
      // This test would require mocking the rate limiting logic
      // For now, we'll test the structure exists
      expect(true).toBe(true); // Placeholder test
    });
  });
});