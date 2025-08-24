# Database Schema

## Firestore Collections and Documents

The database uses Firestore's document-oriented structure with the following main collections:

### 1. Events Collection

**Document Path**: `/events/{eventId}`

**Fields**:
- `id` (string): Unique event identifier
- `title` (string): Event title
- `description` (string): Detailed event description
- `date` (timestamp): Event date and time
- `location` (string): Event location
- `maxAttendees` (number): Maximum number of attendees
- `currentAttendees` (number): Current number of registrations
- `organizerId` (string): User ID of event organizer
- `organizerName` (string): Name of event organizer
- `status` (string): Event status ('active', 'cancelled', 'completed')
- `createdAt` (timestamp): Event creation timestamp
- `updatedAt` (timestamp): Last update timestamp
- `tags` (array): Array of event tags for categorization
- `imageUrl` (string, optional): Event image URL

**Subcollections**:
- `registrations`: References to registration documents

### 2. Registrations Collection

**Document Path**: `/registrations/{registrationId}`

**Fields**:
- `id` (string): Unique registration identifier
- `eventId` (string): Reference to event document
- `userId` (string): Reference to user document
- `userName` (string): Name of registering user
- `userEmail` (string): Email of registering user
- `registrationTime` (timestamp): When registration occurred
- `status` (string): Registration status ('confirmed', 'waitlist', 'cancelled')
- `reason` (string, optional): Optional reason for attending
- `notes` (string, optional): Admin notes
- `attendance` (boolean, optional): Whether user attended

**Relationships**:
- References `events/{eventId}` document
- References `users/{userId}` document

### 3. Users Collection

**Document Path**: `/users/{userId}`

**Fields**:
- `id` (string): Unique user identifier (matches Firebase Auth UID)
- `email` (string): User email address
- `displayName` (string): User's display name
- `photoURL` (string, optional): User profile photo URL
- `role` (string): User role ('user', 'admin', 'organizer')
- `createdAt` (timestamp): Account creation timestamp
- `lastLogin` (timestamp): Last login timestamp
- `preferences` (object): User preferences
  - `emailNotifications` (boolean): Whether to receive email notifications
  - `eventReminders` (boolean): Whether to receive event reminders

**Subcollections**:
- `registrations`: User's registration history

## Data Relationships

### Event-Registration Relationship
- Each event document can have multiple registration documents
- Registration documents reference their parent event
- This allows for efficient querying of all registrations for an event

### User-Registration Relationship
- Each user document can have multiple registration documents
- Registration documents reference their user
- This enables user-specific registration history and management

### User-Event Relationship
- Users can create events (organizerId field)
- This establishes ownership and administrative rights

## Indexing Strategy

### Composite Indexes
- `events` collection: `(status, date)` for active upcoming events
- `registrations` collection: `(eventId, status)` for event-specific registrations
- `registrations` collection: `(userId, registrationTime)` for user history

### Single Field Indexes
- `events.date` for chronological event queries
- `events.organizerId` for organizer-specific events
- `registrations.registrationTime` for chronological registration queries

## Data Validation Rules

- Event dates must be in the future for new events
- Maximum attendees must be greater than 0
- Registration status must be one of the predefined values
- User roles must be one of the allowed roles
- Email addresses must be valid format

## Backup and Recovery

- Firestore automatic backups enabled
- Point-in-time recovery capability
- Export functionality for critical data