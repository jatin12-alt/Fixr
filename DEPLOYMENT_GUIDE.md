# 🚀 Fixr Deployment Guide

## 📋 Prerequisites

Before you begin, make sure you have:
- [ ] Node.js 18+ installed
- [ ] GitHub account with admin access to test repositories
- [ ] Vercel account (free tier is fine)
- [ ] Neon account (for PostgreSQL database)
- [ ] Clerk account (for authentication)
- [ ] Resend account (for email notifications, optional)

---

## 🗃️ Step 1: Database Setup (Neon)

### 1.1 Create Neon Database
1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Sign up or log in
3. Click "New Project"
4. Choose a name (e.g., "fixr-prod")
5. Select a region closest to your users
6. Click "Create Project"

### 1.2 Get Connection String
1. In your Neon project, go to the "Connection Details" tab
2. Copy the "Connection string" (looks like `postgresql://...`)
3. **Important**: Ensure it ends with `?sslmode=require`

### 1.3 Test Database Connection
```bash
# Add to your .env.local temporarily
DATABASE_URL="your-neon-connection-string"

# Test connection
npm run db:prisma:generate
npm run db:prisma:migrate
```

---

## 🔐 Step 2: Authentication Setup (Clerk)

### 2.1 Create Clerk Application
1. Go to [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Click "Add application"
3. Give it a name (e.g., "Fixr Production")
4. Select "Next.js" as the framework
5. Click "Create"

### 2.2 Configure Clerk
1. In your Clerk dashboard, go to "API Keys"
2. Copy the "Publishable key" and "Secret key"
3. Go to "Sessions" → "Configure"
4. Set "Sign in URL" to `/sign-in`
5. Set "Sign up URL" to `/sign-up`
6. Set "After sign in URL" to `/dashboard`
7. Set "After sign up URL" to `/dashboard`

### 2.3 Add Production URLs (After Deployment)
1. Go to "Domains" in Clerk dashboard
2. Add your Vercel URL (we'll get this in Step 5)

---

## 📧 Step 3: Email Setup (Resend - Optional)

### 3.1 Create Resend Account
1. Go to [https://resend.com/](https://resend.com/)
2. Sign up and verify your email
3. Go to "API Keys"
4. Click "Create API Key"
5. Give it a name (e.g., "Fixr Production")
6. Copy the API key

### 3.2 Verify Sending Domain
1. In Resend, go to "Domains"
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps
4. Wait for domain to be verified

---

## 🐙 Step 4: GitHub Integration Setup

### 4.1 Create GitHub OAuth App
1. Go to [https://github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Fill in the form:
   - **Application name**: Fixr Production
   - **Homepage URL**: `https://your-app.vercel.app` (we'll update this after deployment)
   - **Authorization callback URL**: `https://your-app.vercel.app/api/webhook/github/callback`
3. Click "Register application"
4. Copy the "Client ID" and generate a new "Client Secret"

### 4.2 Prepare Test Repository
1. Choose a test repository (or create a new one)
2. Ensure it has GitHub Actions enabled
3. Create a simple workflow file at `.github/workflows/test.yml`:

```yaml
name: Test Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test Step
        run: echo "Testing pipeline"
      - name: Intentional Failure (for testing)
        run: exit 1
        if: github.event_name == 'push' && contains(github.event.head_commit.message, '[test-fail]')
```

---

## 🚀 Step 5: Vercel Deployment

### 5.1 Install Vercel CLI
```bash
npm i -g vercel
```

### 5.2 Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: fixr
# - Directory: ./
# - Vercel wants to build and deploy? Yes
```

### 5.3 Configure Environment Variables in Vercel
1. Go to your Vercel project dashboard
2. Go to "Settings" → "Environment Variables"
3. Add the following variables:

#### Required Variables:
```
DATABASE_URL = your-neon-connection-string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...
CLERK_SECRET_KEY = sk_test_...
GITHUB_CLIENT_ID = your-github-client-id
GITHUB_CLIENT_SECRET = your-github-client-secret
NEXT_PUBLIC_GITHUB_CALLBACK_URL = https://your-app.vercel.app/api/webhook/github/callback
```

#### Optional Variables:
```
RESEND_API_KEY = re_...
NEXT_PUBLIC_VAPID_PUBLIC_KEY = BMf...
VAPID_PRIVATE_KEY = ...
VAPID_EMAIL = your-email@example.com
GITHUB_WEBHOOK_SECRET = your-random-secret
```

### 5.4 Redeploy with Environment Variables
```bash
# Redeploy to pick up environment variables
vercel --prod
```

---

## 🗄️ Step 6: Database Migration

### 6.1 Run Database Migrations
```bash
# Deploy migrations to production
npm run db:prisma:deploy
```

### 6.2 Verify Database Setup
```bash
# Test database connection
curl https://your-app.vercel.app/api/health/database
```

Expected response:
```json
{
  "status": "connected",
  "message": "Database is properly configured and connected"
}
```

---

## 🔧 Step 7: Post-Deployment Configuration

### 7.1 Update Clerk Domains
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to "Domains"
4. Add your Vercel URL: `https://your-app.vercel.app`

### 7.2 Update GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Edit your OAuth app
3. Update:
   - **Homepage URL**: `https://your-app.vercel.app`
   - **Authorization callback URL**: `https://your-app.vercel.app/api/webhook/github/callback`

### 7.3 Configure GitHub Webhooks
1. Go to your test repository
2. Go to "Settings" → "Webhooks"
3. Click "Add webhook"
4. Configure:
   - **Payload URL**: `https://your-app.vercel.app/api/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: Same as `GITHUB_WEBHOOK_SECRET` env var
   - **Events**: Check "Pushes" and "Workflow jobs"
5. Click "Add webhook"

---

## 🧪 Step 8: Testing & Verification

### 8.1 Basic Functionality Test
1. Open `https://your-app.vercel.app`
2. Click "Sign in with GitHub"
3. Complete OAuth flow
4. Verify you're redirected to dashboard

### 8.2 Repository Connection Test
1. In dashboard, click "Connect Repository"
2. Authorize GitHub access
3. Select your test repository
4. Verify it appears in your repository list

### 8.3 Webhook Test
1. Push a commit to your test repository
2. Check Vercel function logs for webhook receipt
3. Verify pipeline appears in Fixr dashboard

### 8.4 AI Analysis Test
1. Trigger a failed pipeline (push with `[test-fail]` in commit message)
2. Wait for AI analysis (usually 30-60 seconds)
3. Verify fix suggestions appear
4. Apply the suggested fix

### 8.5 Email Notification Test
1. In settings, enable email notifications
2. Trigger another failed pipeline
3. Check your email for failure notification
4. Verify email content and formatting

---

## 📊 Step 9: Monitoring Setup

### 9.1 Vercel Analytics
1. Go to Vercel project dashboard
2. Click "Analytics" tab
3. Analytics should be automatically enabled
4. Monitor page views and performance

### 9.2 Database Monitoring
1. Go to [Neon Console](https://console.neon.tech/)
2. Monitor connection usage
3. Check query performance
4. Set up alerts if needed

---

## 🔍 Step 10: Troubleshooting Common Issues

### Database Connection Issues
```bash
# Test connection
curl https://your-app.vercel.app/api/health/database

# Check environment variables in Vercel dashboard
# Ensure DATABASE_URL includes ?sslmode=require
```

### Authentication Issues
- Verify Clerk keys are correct
- Check allowed origins in Clerk dashboard
- Ensure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set

### GitHub Webhook Issues
- Check webhook URL is accessible
- Verify webhook secret matches
- Look at Vercel function logs for webhook errors

### Build Failures
```bash
# Check locally first
npm run deploy:check

# Look at build logs in Vercel dashboard
# Check for missing environment variables
```

---

## 🎛️ Advanced Configuration

### Custom Domain Setup
1. In Vercel dashboard, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update all service URLs to use custom domain

### Push Notifications Setup
1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Add keys to Vercel environment variables
3. Update service worker registration if needed

### Team Features Setup
1. Create first team through UI
2. Invite team members
3. Test role-based permissions
4. Verify audit logging works

---

## 📋 Final Checklist

Before going live, ensure:
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] GitHub OAuth and webhooks working
- [ ] Email notifications tested
- [ ] Team collaboration features tested
- [ ] Analytics dashboard working
- [ ] Real-time notifications working
- [ ] No console errors on production site
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable

---

## 🆘 Support & Resources

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### Emergency Commands
```bash
# Rollback deployment
vercel rollback [deployment-url]

# Check logs
vercel logs

# Redeploy
vercel --prod
```

---

**🎉 Congratulations! Your Fixr app is now production-ready!**

For ongoing maintenance, regularly check:
- Vercel function logs for errors
- Database performance metrics
- GitHub webhook delivery status
- User feedback and bug reports
