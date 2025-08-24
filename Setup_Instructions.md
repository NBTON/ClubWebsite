# University Club Web Platform - Setup Instructions

This guide provides comprehensive step-by-step instructions for setting up the University Club Web Platform, including Firebase project configuration, service enabling, and external integrations.

## Prerequisites

Before starting the setup process, ensure you have:

- A Google account with administrative access
- Node.js (v16 or higher) installed
- npm or yarn package manager
- Git for version control
- Access to Google Cloud Console
- A domain name (optional, for production deployment)

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" (or "Add project")
3. Enter project name: `university-club-platform`
4. Choose your Google Analytics preferences
5. Click "Create project"
6. Wait for project creation to complete

### 1.2 Enable Required Services

#### Authentication
1. In Firebase Console, go to "Authentication" → "Get started"
2. Go to "Sign-in method" tab
3. Enable "Google" provider
4. Add authorized domains:
   - `localhost` (for development)
   - Your production domain (e.g., `university-club.com`)
5. Configure OAuth consent screen:
   - User type: External
   - App name: University Club Platform
   - User support email: Your admin email
   - Developer contact information: Your email

#### Firestore Database
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select location: Choose closest to your users
4. Click "Enable"

#### Cloud Functions
1. Go to "Functions" → "Get started"
2. Enable Cloud Functions API if prompted
3. Note: Functions will be deployed via Firebase CLI

## Step 2: Google Cloud Console Configuration

### 2.1 Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to "APIs & Services" → "Library"
4. Search for "Google Sheets API"
5. Click "Enable"

### 2.2 Create Service Account for Google Sheets

1. In Google Cloud Console, go to "IAM & Admin" → "Service Accounts"
2. Click "Create service account"
3. Name: `university-club-sheets`
4. Description: Service account for Google Sheets integration
5. Click "Create and continue"
6. Grant role: "Editor" (for Google Sheets access)
7. Click "Done"
8. Click on the created service account
9. Go to "Keys" tab
10. Click "Add Key" → "Create new key" → "JSON"
11. Download the JSON file securely

### 2.3 Enable Google Drive API (Required for Sheets)

1. In Google Cloud Console API Library
2. Search for "Google Drive API"
3. Click "Enable"

## Step 3: Firebase CLI Setup

### 3.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 3.2 Login to Firebase

```bash
firebase login
```

### 3.3 Initialize Project

1. Navigate to the `functions` directory
2. Initialize Firebase project:

```bash
firebase init
```

3. Select services:
   - Functions: Yes
   - Firestore: Yes
   - Hosting: Yes (for frontend deployment)

4. Choose existing project: `university-club-platform`
5. Configure functions:
   - Language: TypeScript
   - ESLint: Yes

## Step 4: Environment Configuration

### 4.1 Backend Environment Variables

1. In `functions` directory, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs

# Google Sheets Configuration
GOOGLE_SHEETS_PRIVATE_KEY=your-google-sheets-private-key
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account-email

# Email Configuration (Choose one option)
# Option 1: SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Option 2: Firebase Extensions (if using email extension)
# No additional config needed

# Application Configuration
DEFAULT_TIMEZONE=America/New_York
MAX_EVENT_ATTENDEES=1000
```

### 4.2 Frontend Environment Variables

1. In `university-club-frontend` directory, create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 5: Service-Specific Setup

### 5.1 Firestore Security Rules

1. Copy the security rules from the project:

```bash
# The firestore.rules file should be in university-club-frontend/firestore.rules
# Copy it to functions directory if needed
cp ../university-club-frontend/firestore.rules .
```

2. Deploy security rules:

```bash
firebase deploy --only firestore:rules
```

### 5.2 Cloud Functions Configuration

1. Install dependencies:

```bash
cd functions
npm install
```

2. Set environment variables in Firebase:

```bash
firebase functions:config:set \
  sendgrid.api_key="your-sendgrid-api-key" \
  google_sheets.service_account="path-to-service-account-json"
```

### 5.3 Email Service Setup

#### Option 1: SendGrid Integration

1. Sign up for [SendGrid](https://sendgrid.com/)
2. Create API key with "Mail Send" permissions
3. Verify sender email address
4. Add API key to environment variables

#### Option 2: Firebase Extensions

1. In Firebase Console, go to "Extensions"
2. Install "Send Email" extension
3. Configure SMTP settings
4. Set up email templates

## Step 6: Database Initialization

### 6.1 Create Initial Collections

The Firestore collections will be created automatically when first used. However, you can initialize with sample data:

1. Use Firebase Console to create initial documents
2. Or run initialization scripts (if provided)

### 6.2 Set Up Indexes

Some queries require composite indexes. These will be prompted during development:

```bash
# When you encounter "requires an index" error, Firebase will provide the exact command
firebase deploy --only firestore:indexes
```

## Step 7: Frontend Setup

### 7.1 Install Dependencies

```bash
cd university-club-frontend
npm install
```

### 7.2 Configure Firebase

1. Copy `src/lib/firebase.ts` and update with your config:

```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### 7.3 Build and Test

```bash
npm run build
npm run dev
```

## Step 8: Testing Setup

### 8.1 Install Testing Dependencies

```bash
# Backend tests
cd functions
npm install --save-dev jest @types/jest

# Frontend tests
cd ../university-club-frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### 8.2 Configure Testing Environment

1. Set up Firebase emulators for testing
2. Configure Jest for both frontend and backend
3. Set up test data and mocks

## Step 9: Deployment Preparation

### 9.1 Update Security Rules for Production

1. Change Firestore from "test mode" to "production mode"
2. Update security rules for stricter access control
3. Review and update Cloud Functions permissions

### 9.2 Configure Domain (Optional)

1. In Firebase Console, go to "Hosting"
2. Add custom domain
3. Configure DNS settings
4. Update OAuth authorized domains

## Step 10: Verification Checklist

Before going live, verify:

- [ ] Firebase project created and configured
- [ ] Authentication enabled with Google provider
- [ ] Firestore database initialized
- [ ] Google Sheets API enabled and service account created
- [ ] Email service configured (SendGrid or Firebase Extensions)
- [ ] Environment variables set correctly
- [ ] Security rules deployed
- [ ] Cloud Functions can be deployed
- [ ] Frontend builds successfully
- [ ] Domain configured (if applicable)
- [ ] SSL certificate active (for production)

## Common Setup Issues

### Issue 1: Firebase CLI Authentication
**Problem**: `firebase login` fails
**Solution**: Clear cache and try again:
```bash
firebase logout
firebase login --no-localhost
```

### Issue 2: Permission Errors
**Problem**: Insufficient permissions for Google APIs
**Solution**: Ensure service account has correct roles and APIs are enabled

### Issue 3: Environment Variables Not Loading
**Problem**: Functions can't access environment variables
**Solution**: Deploy functions after setting config:
```bash
firebase functions:config:set key="value"
firebase deploy --only functions
```

## Next Steps

After completing setup:

1. Proceed to [Deployment_Guide.md](Deployment_Guide.md) for deployment instructions
2. Review [User_Manual.md](User_Manual.md) for usage instructions
3. Check [Troubleshooting_Guide.md](Troubleshooting_Guide.md) if you encounter issues

## Support

If you encounter issues during setup:

1. Check Firebase Console for error messages
2. Review Cloud Logging for function errors
3. Verify all prerequisites are met
4. Consult the troubleshooting guide for common solutions

---

**Note**: This setup process typically takes 2-4 hours for first-time setup. Subsequent deployments will be faster.