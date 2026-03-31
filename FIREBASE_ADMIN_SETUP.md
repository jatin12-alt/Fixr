# Firebase Admin SDK Setup Guide

## 🚨 Error Fixed: Private Key Parsing Issue

The error `Failed to parse private key: Error: Too few bytes to read ASN.1 value` has been resolved with better error handling, but you still need proper Firebase Admin credentials for full functionality.

## 🔧 Steps to Fix Firebase Admin Setup

### 1. Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/project/fixr-f0e28/settings/serviceaccounts)
2. Click **"Generate new private key"**
3. Save the JSON file (don't commit to git!)

### 2. Extract Values from JSON File

Your downloaded JSON will look like:
```json
{
  "type": "service_account",
  "project_id": "fixr-f0e28",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@fixr-f0e28.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

### 3. Update Your .env.local File

Add these values to your `.env.local`:

```env
# Firebase Admin SDK (server-side only)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@fixr-f0e28.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_ACTUAL_PRIVATE_KEY_HERE_WITHOUT_QUOTES
-----END PRIVATE KEY-----"
```

**Important:**
- Copy the exact `client_email` from the JSON
- Copy the exact `private_key` from the JSON 
- Keep the quotes around the entire private key
- The private key should contain actual newlines, not `\n` literals

### 4. Alternative: Single Line Format

If you prefer single line format:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----\n"
```

## 🧪 Verify Setup

After updating `.env.local`, restart your dev server:

```bash
npm run dev
```

You should see:
- ✅ `Firebase Admin initialized successfully` in the console
- No more private key parsing errors

## ⚠️ Security Notes

- **NEVER** commit `.env.local` to git
- **NEVER** share your private key
- The private key gives full access to your Firebase project
- In production, use environment variables (Vercel, AWS, etc.)

## 🚀 What This Enables

With proper Firebase Admin setup, you get:
- Server-side token verification
- User management APIs
- Firestore database access
- Custom token generation
- Email sending (if configured)

## 🛠️ Current Status

- ✅ Error handling improved - app won't crash with bad credentials
- ✅ Fallback implementations for development
- ⏳ Waiting for proper credentials from Firebase Console

The app will work for client-side authentication without Firebase Admin, but server-side features require proper setup.
