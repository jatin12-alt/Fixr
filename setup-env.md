# Environment Setup Required

The dashboard is failing because you need to set up your environment variables.

## Quick Fix:

1. **Create `.env.local` file** in the root directory (next to this file)
2. **Add the following minimum required variables:**

```env
# Database - Replace with your actual database URL
DATABASE_URL="postgresql://username:password@localhost:5432/fixr"

# Clerk Authentication - Get these from https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_key_here"
CLERK_SECRET_KEY="sk_test_your_key_here"

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# GitHub Integration - Get these from https://github.com/settings/applications/new
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
NEXT_PUBLIC_GITHUB_CALLBACK_URL="http://localhost:3000/api/webhook/github/callback"
```

## Get Required Keys:

1. **Clerk Authentication:**
   - Go to https://dashboard.clerk.com/
   - Create a new application or use existing one
   - Copy the Publishable Key and Secret Key

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
