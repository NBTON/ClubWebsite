import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';
import sgMail from '@sendgrid/mail';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize SendGrid
sgMail.setApiKey(functions.config().sendgrid?.key || '');

// Google Sheets setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
  scopes: SCOPES,
  credentials: {
    private_key: functions.config().google?.private_key?.replace(/\\n/g, '\n'),
    client_email: functions.config().google?.client_email,
  },
});

const sheets = google.sheets({ version: 'v4', auth });

// Types
interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registrationTime: admin.firestore.Timestamp;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  reason?: string;
  notes?: string;
  attendance?: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: admin.firestore.Timestamp;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  organizerId: string;
  organizerName: string;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  tags: string[];
  imageUrl?: string;
}

// Email templates
const getRegistrationEmailTemplate = (userName: string, eventTitle: string) => `
Dear ${userName},

Thank you for your interest in "${eventTitle}"!

We have received your registration request and will review it shortly. You will receive another email once your registration has been approved.

Best regards,
University Club Team
`;

const getApprovalEmailTemplate = (userName: string, eventTitle: string) => `
Dear ${userName},

Great news! Your registration for "${eventTitle}" has been approved.

You are now confirmed to attend the event. We look forward to seeing you there!

Best regards,
University Club Team
`;

// Cloud Function: Send email on registration
export const sendOnRegisterEmail = functions.firestore
  .document('registrations/{registrationId}')
  .onCreate(async (snap, context) => {
    try {
      const registration = snap.data() as Registration;
      const eventDoc = await admin.firestore()
        .collection('events')
        .doc(registration.eventId)
        .get();

      if (!eventDoc.exists) {
        console.error('Event not found:', registration.eventId);
        return;
      }

      const event = eventDoc.data() as Event;

      const msg = {
        to: registration.userEmail,
        from: functions.config().email?.from || 'noreply@universityclub.com',
        subject: `Registration Received - ${event.title}`,
        text: getRegistrationEmailTemplate(registration.userName, event.title),
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Registration Received</h2>
            <p>Dear ${registration.userName},</p>
            <p>Thank you for your interest in <strong>"${event.title}"</strong>!</p>
            <p>We have received your registration request and will review it shortly. You will receive another email once your registration has been approved.</p>
            <br>
            <p>Best regards,<br>University Club Team</p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log('Registration email sent to:', registration.userEmail);

    } catch (error) {
      console.error('Error sending registration email:', error);
      throw error;
    }
  });

// Cloud Function: Send email on approval
export const sendOnApproveEmail = functions.firestore
  .document('registrations/{registrationId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data() as Registration;
      const after = change.after.data() as Registration;

      // Only send email if status changed to 'confirmed' from something else
      if (before.status !== 'confirmed' && after.status === 'confirmed') {
        const eventDoc = await admin.firestore()
          .collection('events')
          .doc(after.eventId)
          .get();

        if (!eventDoc.exists) {
          console.error('Event not found:', after.eventId);
          return;
        }

        const event = eventDoc.data() as Event;

        const msg = {
          to: after.userEmail,
          from: functions.config().email?.from || 'noreply@universityclub.com',
          subject: `Registration Approved - ${event.title}`,
          text: getApprovalEmailTemplate(after.userName, event.title),
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Registration Approved</h2>
              <p>Dear ${after.userName},</p>
              <p>Great news! Your registration for <strong>"${event.title}"</strong> has been approved.</p>
              <p>You are now confirmed to attend the event. We look forward to seeing you there!</p>
              <br>
              <p>Best regards,<br>University Club Team</p>
            </div>
          `,
        };

        await sgMail.send(msg);
        console.log('Approval email sent to:', after.userEmail);
      }

    } catch (error) {
      console.error('Error sending approval email:', error);
      throw error;
    }
  });

// Cloud Function: Export to Google Sheets
export const exportToSheets = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin or organizer
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'User profile not found');
  }

  const user = userDoc.data();
  if (user?.role !== 'admin' && user?.role !== 'organizer') {
    throw new functions.https.HttpsError('permission-denied', 'User must be admin or organizer');
  }

  try {
    const { eventId, spreadsheetId } = data;

    if (!eventId) {
      throw new functions.https.HttpsError('invalid-argument', 'Event ID is required');
    }

    // Get event details
    const eventDoc = await admin.firestore()
      .collection('events')
      .doc(eventId)
      .get();

    if (!eventDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Event not found');
    }

    const event = eventDoc.data() as Event;

    // Check if user is the organizer or admin
    if (user.role !== 'admin' && event.organizerId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'User must be the event organizer or admin');
    }

    // Get registrations for the event
    const registrationsSnapshot = await admin.firestore()
      .collection('registrations')
      .where('eventId', '==', eventId)
      .get();

    const registrations = registrationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Registration[];

    // Prepare data for Google Sheets
    const headers = ['Name', 'Email', 'Reason', 'Status', 'Timestamp'];
    const rows = registrations.map(reg => [
      reg.userName,
      reg.userEmail,
      reg.reason || '',
      reg.status,
      reg.registrationTime.toDate().toISOString()
    ]);

    const values = [headers, ...rows];

    // Use provided spreadsheet ID or create new one
    let targetSpreadsheetId = spreadsheetId;

    if (!targetSpreadsheetId) {
      // Create new spreadsheet
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Event Registrations - ${event.title}`,
          },
        },
      });
      targetSpreadsheetId = spreadsheet.data.spreadsheetId!;
    }

    // Write data to sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: values,
      },
    });

    console.log(`Exported ${registrations.length} registrations to Google Sheets`);

    return {
      success: true,
      spreadsheetId: targetSpreadsheetId,
      exportedCount: registrations.length,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSpreadsheetId}/edit`
    };

  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    throw new functions.https.HttpsError('internal', 'Failed to export data');
  }
});