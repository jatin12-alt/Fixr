# Environment Setup Required

The dashboard is failing because you need to set up your environment variables.

## Quick Fix:

1. **Create `.env.local` file** in the root directory (next to this file)
2. **Add the following minimum required variables:**

```env
# Database - Replace with your actual database URL
DATABASE_URL="postgresql://username:password@localhost:5432/fixr"

# Firebase Authentication - Get these from https://console.firebase.google.com/
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key-here"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="fixr-f0e28.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="fixr-f0e28"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="fixr-f0e28.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="972380168221"
NEXT_PUBLIC_FIREBASE_APP_ID="1:972380168221:web:844c5c7566d2b2a15ee6f4"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-0S83WLCJXL"

# Firebase Admin SDK (server-side only - get from service account)
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@fixr-f0e28.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# Firebase is now used for authentication
# No additional URLs needed beyond Firebase config above

# GitHub Integration - Get these from https://github.com/settings/applications/new
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
NEXT_PUBLIC_GITHUB_CALLBACK_URL="http://localhost:3000/api/webhook/github/callback"
```

## Get Required Keys:

1. **Firebase Authentication:**
   - Go to https://console.firebase.google.com/
   - Create a new project or use existing one
   - Get service account credentials from Project Settings
   - Copy the private key and client email

2. **GitHub OAuth:**
   - Go to https://github.com/settings/applications/new
   - Create a new OAuth App
   - Set callback URL: `http://localhost:3000/api/webhook/github/callback`
   - Copy Client ID and generate Client Secret

3. **Database:**
   - Option A: Use Neon (recommended) - https://neon.tech/
   - Option B: Use local PostgreSQL
   - Copy the connection string

## After Setup:

1. Restart your development server
2. The dashboard should load properly
3. If you still get errors, check the browser console for more details

## Alternative - Test Mode:

If you want to test without setting up all services, you can temporarily modify the dashboard API to return mock data.
