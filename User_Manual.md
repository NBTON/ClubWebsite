# University Club Web Platform - User Manual

Welcome to the University Club Web Platform! This comprehensive user manual will guide you through all the features and functionality available on the platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Roles and Permissions](#user-roles)
3. [Authentication and Account Setup](#authentication)
4. [Browsing and Discovering Events](#browsing-events)
5. [Event Registration](#event-registration)
6. [Ali's Registration Workflow Example](#ali-workflow)
7. [Managing Your Profile](#profile-management)
8. [Admin Dashboard and Management](#admin-dashboard)
9. [Event Creation and Management](#event-management)
10. [Registration Management](#registration-management)
11. [Data Export and Reporting](#data-export)
12. [Email Notifications](#notifications)
13. [Troubleshooting Common Issues](#troubleshooting)
14. [Frequently Asked Questions](#faq)

## Getting Started

### Platform Overview

The University Club Web Platform is designed to connect university students with club events and activities. The platform offers:

- **For Students**: Easy event discovery and registration
- **For Organizers**: Event creation and management tools
- **For Admins**: Comprehensive oversight and reporting

### System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Device**: Desktop, tablet, or mobile device
- **Internet**: Stable internet connection
- **Account**: Google account for authentication

## User Roles and Permissions

### 1. Student/User
- Browse and search events
- Register for events with optional reason
- View registration history
- Manage personal profile
- Receive email notifications

### 2. Event Organizer
- All Student permissions
- Create and manage events
- View registrations for their events
- Edit event details before publication
- Cancel events with notifications

### 3. Administrator
- All Organizer permissions
- Manage all events and users
- Export registration data
- User role management
- System-wide settings

## Authentication and Account Setup

### Signing In

1. **Visit the Platform**
   - Navigate to your university's club platform URL
   - Click "Sign In" or "Login"

2. **Google Authentication**
   - Click "Continue with Google"
   - Select your university Google account
   - Grant necessary permissions

3. **Automatic Profile Creation**
   - Your profile is created automatically
   - Basic information is pulled from Google
   - You can update details in your profile

### First-Time User Experience

After signing in, you'll see:
- Welcome message
- Quick start guide
- Recommended events
- Profile completion prompts

## Browsing and Discovering Events

### Event Discovery

1. **Home Page**
   - Featured upcoming events
   - Quick registration buttons
   - Event categories and filters

2. **Event List**
   - Sort by date, popularity, or category
   - Filter by organizer, location, or tags
   - Search by title or description

3. **Event Details Page**
   - Complete event information
   - Registration status and capacity
   - Organizer contact information
   - Similar events recommendations

### Event Information

Each event displays:
- **Title and Description**: Event purpose and agenda
- **Date and Time**: When the event occurs
- **Location**: Venue and room information
- **Capacity**: Current registrations vs. maximum attendees
- **Organizer**: Who is hosting the event
- **Registration Deadline**: When registration closes
- **Tags**: Categories for easy filtering

## Event Registration

### Quick Registration Process

1. **Find an Event**
   - Browse or search for events
   - Click on an event you're interested in

2. **Register**
   - Click the "Register" button
   - Optional: Add a reason for attending
   - Click "Confirm Registration"

3. **Confirmation**
   - Immediate on-screen confirmation
   - Email notification sent to your account
   - Registration appears in your profile

### Registration Options

- **Simple Registration**: One-click registration
- **Registration with Reason**: Optional text field explaining interest
- **Waitlist**: Automatic waitlist if event is full
- **Cancellation**: Easy cancellation up to event deadline

### Registration Status

- **Confirmed**: Successfully registered
- **Waitlist**: Event full, added to waitlist
- **Cancelled**: Registration cancelled
- **Attended**: Marked as attended by organizer

## Ali's Registration Workflow Example

### Scenario: Ali Discovers and Registers for AI Workshop

**Step 1: Discovery**
- Ali visits the platform homepage
- Sees "AI Workshop" featured event
- Clicks to view event details

**Input Example:**
```
Event Details Viewed:
- Title: "AI Workshop: Future of Technology"
- Date: March 15, 2024, 2:00 PM
- Location: University Auditorium
- Capacity: 47/100 registered
- Description: "Learn about artificial intelligence trends and applications"
```

**Step 2: Registration**
- Ali clicks "Register" button
- Adds reason: "I'm interested in learning about AI for my research project"
- Confirms registration

**Input/Output Example:**
```
Input:
- Event ID: "event-123"
- User ID: "user-456"
- Reason: "I'm interested in learning about AI for my research project"

Output:
- Registration confirmation: "Successfully registered for 'AI Workshop'"
- Registration ID: "reg-789"
- Status: "confirmed"
- Email notification sent
```

**Step 3: Email Confirmation**
- Ali receives email confirmation
- Email includes event details and registration info

**Email Example:**
```
Subject: Registration Confirmed - AI Workshop

Dear Ali,
You have successfully registered for the AI Workshop scheduled for March 15, 2024.

Event Details:
- Date: March 15, 2024
- Time: 2:00 PM
- Location: University Auditorium
- Your registration reason: "I'm interested in learning about AI for my research project"

If you need to cancel your registration, please visit the platform.
```

**Step 4: Profile Update**
- Registration appears in Ali's profile
- Shows upcoming events and registration history
- Ali can manage registration or view event details

### What Happens Behind the Scenes

1. **Validation**: System checks if event exists and has capacity
2. **Registration Creation**: New registration document created in database
3. **Email Trigger**: Cloud Function sends confirmation email
4. **Real-time Update**: Event capacity updates across all users
5. **Notification**: Organizer notified of new registration

## Managing Your Profile

### Profile Information

Access your profile by clicking your name/photo in the top right corner.

**Editable Information:**
- Display name
- Profile photo
- Email preferences
- Notification settings

**View-Only Information:**
- Registration history
- Account creation date
- User role
- Google account email

### Notification Preferences

Manage when you receive emails:
- Event registration confirmations
- Event reminders (24 hours before)
- Event cancellations
- New event notifications
- Weekly digest emails

## Admin Dashboard and Management

### Accessing Admin Dashboard

1. Sign in with admin account
2. Click "Admin Dashboard" in navigation
3. Access restricted to admin and organizer roles

### Dashboard Overview

**Key Metrics:**
- Total events created
- Total registrations
- Upcoming events
- Recent activity

**Quick Actions:**
- Create new event
- Export data
- Manage users
- View reports

## Event Creation and Management

### Creating a New Event

1. **Access Event Creation**
   - Go to Admin Dashboard
   - Click "Create Event"

2. **Event Details Form**
   ```
   Required Fields:
   - Title: Event name
   - Description: Detailed description
   - Date & Time: When event occurs
   - Location: Venue information
   - Max Attendees: Capacity limit
   - Category/Tags: For organization

   Optional Fields:
   - Image: Event poster/banner
   - Registration Deadline: When registration closes
   - Contact Information: Organizer contact
   ```

3. **Preview and Publish**
   - Preview event as users will see it
   - Edit any details
   - Publish when ready

**Example Event Creation:**
```
Input:
- Title: "Tech Talk: Future of Web Development"
- Description: "Join us for an exciting discussion about the latest trends in web development"
- Date: "2024-03-20T14:00:00Z"
- Location: "University Auditorium"
- Max Attendees: 100

Output:
- Event created with ID: "event-789"
- Event appears in events list
- Notification sent to all users (if enabled)
```

### Managing Existing Events

**Event Actions:**
- Edit event details (before publication)
- Cancel event with notifications
- View registration list
- Export registration data
- Duplicate event for recurring events

## Registration Management

### Viewing Registrations

1. **Event-Specific View**
   - Click on event in admin dashboard
   - View all registrations
   - See registration reasons and timestamps

2. **Bulk Operations**
   - Export all registrations
   - Send bulk notifications
   - Mark attendance
   - Handle cancellations

### Registration Data Export

**Export Process:**
1. Select event or date range
2. Choose export format (Google Sheets)
3. Click "Export Registrations"
4. Receive confirmation with spreadsheet link

**Example Export Output:**
```
Google Sheet: "University Club - Event Registrations"

Sheet 1: "AI Workshop Registrations"
| Registration ID | User Name | Email | Registration Date | Status | Reason |
|----------------|-----------|-------|-------------------|--------|--------|
| reg-001 | John Doe | john@university.edu | 2024-03-01 | confirmed | Interested in AI |
| reg-002 | Jane Smith | jane@university.edu | 2024-03-02 | confirmed | Research project |

Sheet 2: "Summary"
| Total Registrations | Confirmed | Waitlist | Cancelled |
|-------------------|------------|----------|-----------|
| 150 | 120 | 20 | 10 |
```

## Data Export and Reporting

### Export Options

1. **Single Event Export**
   - Export specific event registrations
   - Includes all registration details
   - Automatic Google Sheets creation

2. **Bulk Export**
   - Multiple events at once
   - Date range selection
   - Combined reporting

3. **Scheduled Exports**
   - Set up automatic weekly exports
   - Custom report templates
   - Email delivery options

### Report Features

**Standard Reports:**
- Registration summary
- Attendance tracking
- Event popularity analysis
- User engagement metrics

## Email Notifications

### Notification Types

1. **Registration Confirmations**
   - Sent immediately after registration
   - Includes event details and registration info

2. **Event Reminders**
   - Sent 24 hours before event
   - Includes location and time confirmation

3. **Event Updates**
   - Cancellation notifications
   - Time/location changes
   - Important announcements

4. **Admin Notifications**
   - New registrations
   - Event capacity warnings
   - System alerts

### Managing Notifications

**User Preferences:**
- Enable/disable notification types
- Choose email frequency
- Set quiet hours
- Unsubscribe options

## Troubleshooting Common Issues

### Registration Issues

**Problem: "Event is full"**
- Solution: Added to waitlist automatically
- Alternative: Check for similar events or future dates

**Problem: "Already registered"**
- Solution: View registration in profile
- Alternative: Contact organizer for special cases

**Problem: Registration not showing**
- Solution: Refresh page or check email for confirmation
- Alternative: Contact support if persists

### Account Issues

**Problem: Can't sign in**
- Solution: Clear browser cache, try different browser
- Alternative: Use incognito mode or different device

**Problem: Wrong profile information**
- Solution: Update profile in settings
- Alternative: Contact admin for account corrections

### Event Issues

**Problem: Event not appearing**
- Solution: Check date filters and search terms
- Alternative: Contact organizer for event status

**Problem: Can't create event**
- Solution: Verify admin/organizer role
- Alternative: Request role upgrade from admin

## Frequently Asked Questions

### General Questions

**Q: Is the platform free to use?**
A: Yes, the platform is completely free for all university students and staff.

**Q: Can I use the platform on mobile?**
A: Yes, the platform is fully responsive and works on all devices.

**Q: How do I get admin access?**
A: Contact your university's club coordinator or IT department.

### Registration Questions

**Q: Can I register for multiple events?**
A: Yes, you can register for as many events as you like.

**Q: What if I can't attend after registering?**
A: You can cancel your registration up to the event deadline.

**Q: How do I know if I'm on the waitlist?**
A: Your registration status will show "Waitlist" in your profile.

### Event Creation Questions

**Q: How far in advance can I create events?**
A: You can create events up to 6 months in advance.

**Q: Can I edit events after publishing?**
A: Yes, but major changes will notify all registrants.

**Q: How do I add an event image?**
A: Upload a JPG or PNG file up to 5MB during event creation.

### Technical Questions

**Q: Why am I not receiving emails?**
A: Check your spam folder and email preferences in your profile.

**Q: How do I export registration data?**
A: Go to Admin Dashboard → Select event → Click "Export Registrations".

**Q: Can I integrate with other university systems?**
A: The platform uses standard APIs and can be integrated with most university systems.

## Support and Contact

### Getting Help

1. **Self-Service**
   - Check this user manual
   - Review FAQ section
   - Check troubleshooting guides

2. **Contact Support**
   - Use in-platform help form
   - Email: support@university-club.edu
   - Office hours: Monday-Friday, 9 AM - 5 PM

3. **Community Support**
   - User forums
   - Knowledge base
   - Video tutorials

### Feedback

We welcome your feedback to improve the platform:
- Feature requests
- Bug reports
- Usability suggestions
- General comments

---

**Last Updated**: December 2024
**Platform Version**: 1.0.0

For the latest updates and new features, check the platform's "What's New" section regularly.