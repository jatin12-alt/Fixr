# Fixr App Setup Checklist

## 🚨 Current Issues Fixed
- ✅ ChunkLoadError resolved with client wrapper
- ✅ Firebase Admin private key parsing error handled gracefully
- ✅ Authentication flow improved with better error handling
- ✅ GitHub status API updated with debug information

## 🔧 Complete Setup Steps

### 1. Environment Variables (.env.local)

Create/update your `.env.local` file with these variables:

```env
# Database (Required)
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Firebase Public (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyClTAy3HBAxQFsk9lYY5ZFFkRAOkw0hgbc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fixr-f0e28.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fixr-f0e28
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fixr-f0e28.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972380168221
NEXT_PUBLIC_FIREBASE_APP_ID=1:972380168221:web:844c5c7566d2b2a15ee6f4
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-0S83WLCJXL

# Firebase Admin (Required for server-side features)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@fixr-f0e28.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_ACTUAL_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----"

# GitHub OAuth (Required for GitHub integration)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Other Services
GROQ_API_KEY=gsk_your_groq_api_key
RESEND_API_KEY=re_your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
TOKEN_ENCRYPTION_KEY=your-32-byte-encryption-key-here
```

### 2. Firebase Console Setup

1. **Enable Authentication Providers:**
   - Go to [Firebase Console](https://console.firebase.google.com/project/fixr-f0e28/authentication/providers)
   - Enable **Google** provider
   - Enable **Email/Password** provider
   - GitHub should already be enabled

2. **Get Admin Credentials:**
   - Go to [Service Accounts](https://console.firebase.google.com/project/fixr-f0e28/settings/serviceaccounts)
   - Click "Generate new private key"
   - Save the JSON file and extract `client_email` and `private_key`

### 3. GitHub OAuth Setup

1. **Create GitHub OAuth App:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/github/callback`

2. **Update Firebase GitHub Configuration:**
   - In Firebase Console > Authentication > Sign-in method > GitHub
   - Enable and add your GitHub Client ID and Secret

### 4. Database Setup

1. **Neon Database:**
   - Create a Neon database at [neon.tech](https://neon.tech)
   - Get the connection string
   - Add to `DATABASE_URL` in `.env.local`

2. **Run Migrations:**
   ```bash
   npm run db:push
   ```

## 🧪 Testing Your Setup

### 1. Check All Connections
Visit: `http://localhost:3000/debug`
- Shows status of database, Firebase, and environment variables
- Green = good, Yellow = warning, Red = issue

### 2. Test Authentication
Visit: `http://localhost:3000/sign-in`
- Try GitHub OAuth (should work if set up)
- Try Google OAuth (after Firebase console setup)
- Try Email/Password (after Firebase console setup)

### 3. Test GitHub Integration
Visit: `http://localhost:3000/repos`
- Should show GitHub connection status
- If 401 error, check authentication flow

## 🚀 Common Issues & Solutions

### Issue: "Status API failed: 401"
**Cause:** Authentication token not being verified properly
**Fix:** 
1. Check Firebase Admin credentials
2. Visit `/debug` to see connection status
3. Ensure user is logged in

### Issue: "Database connection failed"
**Cause:** DATABASE_URL missing or incorrect
**Fix:**
1. Check Neon database is running
2. Verify connection string format
3. Ensure no typos in `.env.local`

### Issue: "Firebase Admin not configured"
**Cause:** Missing or malformed private key
**Fix:**
1. Download new private key from Firebase Console
2. Ensure proper formatting with newlines
3. Check `FIREBASE_CLIENT_EMAIL` is correct

### Issue: "ChunkLoadError"
**Cause:** SSR issues with Firebase initialization
**Fix:** ✅ Already resolved with client wrapper

## 📋 Verification Checklist

Before deploying to production, verify:

- [ ] All environment variables set in `.env.local`
- [ ] Database connection working (check `/debug`)
- [ ] Firebase Admin initialized (check `/debug`)
- [ ] Authentication providers enabled in Firebase Console
- [ ] GitHub OAuth app created and configured
- [ ] Can sign in with at least one method
- [ ] Can access `/repos` page without 401 errors
- [ ] Database tables created (`npm run db:push`)

## 🎯 Quick Start Commands

```bash
# Install dependencies
npm install

# Check database connection
npm run db:push

# Start development server
npm run dev

# Test connections
# Visit http://localhost:3000/debug

# Test authentication
# Visit http://localhost:3000/sign-in
```

## 🆘 Still Having Issues?

1. Check the browser console for JavaScript errors
2. Check the terminal for server-side errors
3. Visit `/debug` page for connection status
4. Review environment variables in `.env.local`
5. Ensure all Firebase Console providers are enabled

The app is designed to work even with some services missing, but full functionality requires complete setup.
