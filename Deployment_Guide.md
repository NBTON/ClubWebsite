# University Club Web Platform - Deployment Guide

This guide provides detailed instructions for deploying the University Club Web Platform to production, including Firestore rules, Cloud Functions, and the frontend application.

## Prerequisites

Before deployment, ensure:

- [ ] Firebase project is set up (see [Setup_Instructions.md](Setup_Instructions.md))
- [ ] All environment variables are configured
- [ ] Code is tested and ready for production
- [ ] You have Firebase CLI installed and authenticated
- [ ] Domain is configured (optional)

## Deployment Overview

The platform consists of three main components:

1. **Firestore Database** - NoSQL database with security rules
2. **Cloud Functions** - Backend serverless functions
3. **Frontend Application** - Next.js React application

## Step 1: Pre-Deployment Checklist

### 1.1 Environment Verification

```bash
# Check Firebase project
firebase projects:list

# Verify current project
firebase use

# Check Firebase CLI version
firebase --version
```

### 1.2 Code Preparation

```bash
# Backend preparation
cd functions
npm run build
npm test

# Frontend preparation
cd ../university-club-frontend
npm run build
npm run lint
```

### 1.3 Configuration Validation

Verify all required files exist:

- [ ] `functions/.env` - Environment variables
- [ ] `functions/package.json` - Dependencies
- [ ] `university-club-frontend/.env.local` - Frontend config
- [ ] `firestore.rules` - Database security rules
- [ ] `firestore.indexes.json` - Database indexes

## Step 2: Firestore Deployment

### 2.1 Deploy Security Rules

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules
```

**Expected Output:**
```
=== Deploying to 'university-club-platform'...

i  deploying firestore
i  firestore: reading rules file firestore.rules...
✔  firestore: rules file firestore.rules uploaded successfully

✔  Deploy complete!
```

### 2.2 Deploy Database Indexes

```bash
# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

**Expected Output:**
```
=== Deploying to 'university-club-platform'...

i  deploying firestore
i  firestore: reading indexes file firestore.indexes.json...
✔  firestore: indexes file firestore.indexes.json uploaded successfully

✔  Deploy complete!
```

### 2.3 Verify Rules Deployment

1. Go to Firebase Console → Firestore Database → Rules
2. Verify the latest rules are active
3. Check for any syntax errors or warnings

## Step 3: Cloud Functions Deployment

### 3.1 Prepare Functions for Deployment

```bash
cd functions

# Install production dependencies
npm ci --only=production

# Build functions
npm run build

# Set environment variables (if not already set)
firebase functions:config:set \
  sendgrid.api_key="your-sendgrid-api-key" \
  google_sheets.service_account="path-to-service-account-json"
```

### 3.2 Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions
```

**Expected Output:**
```
=== Deploying to 'university-club-platform'...

i  deploying functions
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (X.XX KB) for uploading

✔  functions[createEvent(us-central1)]: Successful create operation.
✔  functions[registerForEvent(us-central1)]: Successful create operation.
✔  functions[exportRegistrations(us-central1)]: Successful create operation.
✔  functions[sendNotification(us-central1)]: Successful create operation.

✔  Deploy complete!
```

### 3.3 Verify Function Deployment

1. Go to Firebase Console → Functions
2. Verify all functions are deployed and active
3. Check function logs for any errors
4. Test a function manually if needed

## Step 4: Frontend Deployment

### 4.1 Build Frontend Application

```bash
cd university-club-frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Export static files (optional, for static hosting)
npm run export
```

### 4.2 Deploy to Firebase Hosting

```bash
# Deploy frontend
firebase deploy --only hosting
```

**Expected Output:**
```
=== Deploying to 'university-club-platform'...

i  deploying hosting
i  hosting: preparing public directory for upload...
i  hosting: X files uploaded
i  hosting[university-club-platform]: beginning deploy...
i  hosting[university-club-platform]: upload complete

✔  hosting[university-club-platform]: release complete

✔  Deploy complete!
```

### 4.3 Alternative Deployment Options

#### Option 1: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option 2: Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=university-club-frontend
```

## Step 5: Post-Deployment Verification

### 5.1 Health Checks

1. **Frontend Health Check**
   ```bash
   curl -I https://your-project.web.app
   ```
   Expected: HTTP 200 OK

2. **Function Health Check**
   ```bash
   curl -X POST https://us-central1-your-project.cloudfunctions.net/createEvent \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

3. **Database Access Check**
   - Verify Firestore rules are working
   - Test read/write operations from frontend

### 5.2 Functional Testing

Test key user flows:

1. **Authentication Flow**
   - Google login
   - User profile creation
   - Session persistence

2. **Event Management**
   - Event creation (admin)
   - Event browsing (user)
   - Event registration

3. **Data Export**
   - Registration export to Google Sheets
   - Email notifications

### 5.3 Performance Testing

```bash
# Use Lighthouse for performance audit
npx lighthouse https://your-project.web.app --output=json --output-path=./report.json
```

## Step 6: Environment-Specific Configurations

### 6.1 Development Environment

```bash
# Use Firebase emulators for local development
firebase emulators:start

# Set development environment
firebase use development
```

### 6.2 Staging Environment

```bash
# Create staging project
firebase use staging

# Deploy to staging
firebase deploy --only hosting:functions
```

### 6.3 Production Environment

```bash
# Switch to production
firebase use production

# Full production deployment
firebase deploy
```

## Step 7: Rollback Procedures

### 7.1 Function Rollback

```bash
# Rollback to previous version
firebase functions:rollback createEvent --version=1

# Or rollback all functions
firebase functions:rollback --all
```

### 7.2 Hosting Rollback

```bash
# View hosting versions
firebase hosting:versions:list

# Rollback to specific version
firebase hosting:rollback your-site-hash
```

### 7.3 Database Rollback

For Firestore:
1. Go to Firebase Console → Firestore Database → Import/Export
2. Use backup to restore previous state
3. Note: Security rules changes require manual rollback

## Step 8: Monitoring and Maintenance

### 8.1 Set Up Monitoring

1. **Firebase Monitoring**
   - Go to Firebase Console → Functions → Monitoring
   - Set up alerts for function failures
   - Monitor execution times and memory usage

2. **Custom Logging**
   ```javascript
   // In Cloud Functions
   console.log('Function executed successfully');
   console.error('Error occurred:', error);
   ```

3. **Performance Monitoring**
   - Enable Firebase Performance Monitoring
   - Monitor page load times
   - Track function execution performance

### 8.2 Backup Strategy

1. **Automatic Backups**
   - Firestore: Daily automatic backups
   - Functions: Version history
   - Hosting: Deployment history

2. **Manual Backups**
   ```bash
   # Export Firestore data
   gcloud firestore export gs://your-backup-bucket

   # Export functions
   firebase functions:export
   ```

## Step 9: Security Post-Deployment

### 9.1 Security Verification

1. **Access Control**
   - Verify Firestore rules are restrictive
   - Check function permissions
   - Review authentication settings

2. **SSL/TLS**
   - Ensure HTTPS is enabled
   - Check SSL certificate validity
   - Verify secure headers

3. **API Security**
   - Validate API keys are secure
   - Check rate limiting
   - Review CORS settings

### 9.2 Security Hardening

```javascript
// Add security headers in functions
const cors = require('cors')({
  origin: ['https://your-domain.com'],
  credentials: true
});
```

## Step 10: Continuous Deployment (Optional)

### 10.1 GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - uses: w9jds/firebase-action@v2.0.0
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### 10.2 Deployment Automation

```bash
# Set up CI/CD pipeline
firebase use production
firebase deploy --only hosting:functions --token $FIREBASE_TOKEN
```

## Troubleshooting Deployment Issues

### Common Issues

1. **Functions Deployment Fails**
   - Check function logs in Firebase Console
   - Verify environment variables are set
   - Check for syntax errors in functions

2. **Hosting Deployment Fails**
   - Verify build output exists
   - Check Firebase project permissions
   - Ensure hosting is enabled

3. **Database Connection Issues**
   - Verify Firestore is enabled
   - Check security rules syntax
   - Test with Firebase Console

### Debug Commands

```bash
# Check deployment status
firebase deploy --debug

# View function logs
firebase functions:log

# Test functions locally
firebase emulators:start --only functions

# Check project configuration
firebase projects:list
```

## Deployment Checklist

- [ ] Pre-deployment tests passed
- [ ] Environment variables configured
- [ ] Security rules reviewed
- [ ] Functions built successfully
- [ ] Frontend built successfully
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed
- [ ] Frontend deployed
- [ ] Health checks passed
- [ ] Functional testing completed
- [ ] Performance verified
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Rollback plan documented

## Next Steps

After successful deployment:

1. Monitor application performance
2. Set up user feedback collection
3. Plan for feature updates and maintenance
4. Review and optimize costs
5. Implement additional security measures

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firebase Functions Guide](https://firebase.google.com/docs/functions)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)

---

**Note**: Deployment typically takes 5-15 minutes depending on the size of your application and internet connection speed.