# 🚀 Fixr Deployment Checklist

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] **All env vars added to Vercel dashboard**
  - [ ] `DATABASE_URL` (Neon PostgreSQL connection string)
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` (Firebase public API key)
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (Firebase project ID)
  - [ ] `FIREBASE_CLIENT_EMAIL` (Firebase Admin SDK client email)
  - [ ] `FIREBASE_PRIVATE_KEY` (Firebase Admin SDK private key)
  - [ ] `RESEND_API_KEY` (Email notifications - optional)
  - [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (Push notifications - optional)
  - [ ] `VAPID_PRIVATE_KEY` (Push notifications - optional)
  - [ ] `VAPID_EMAIL` (Push notifications - optional)
  - [ ] `GITHUB_CLIENT_ID` (GitHub OAuth)
  - [ ] `GITHUB_CLIENT_SECRET` (GitHub OAuth)
  - [ ] `NEXT_PUBLIC_GITHUB_CALLBACK_URL` (Production webhook URL)
  - [ ] `GITHUB_WEBHOOK_SECRET` (Webhook security - recommended)

### Database Setup
- [ ] **Neon DB created and connection string copied**
  - [ ] Database created at https://console.neon.tech/
  - [ ] Connection string added to Vercel env vars
  - [ ] Test connection locally first

- [ ] **Prisma migrations run on production DB**
  ```bash
  # Run locally to generate migration files
  npm run db:prisma:migrate
  
  # Deploy to production
  npm run db:prisma:deploy
  ```

### Code Quality
- [ ] **npm run build succeeds locally**
  ```bash
  npm run deploy:check
  ```

- [ ] **npx tsc --noEmit passes (no TypeScript errors)**
  ```bash
  npm run type-check
  ```

- [ ] **npm run lint passes**
  ```bash
  npm run lint
  ```

### Security & Configuration
- [ ] **.env.local is in .gitignore**
  - [ ] Verify no secrets committed to repo
  - [ ] Check `git status` shows no .env files

- [ ] **No hardcoded localhost URLs in code**
  - [ ] Search for "localhost:3000" in codebase
  - [ ] Replace with environment variables

### Third-Party Services
- [ ] **Firebase configured**
  - [ ] Production URL added to allowed origins
  - [ ] Sign-in/sign-up URLs configured correctly

- [ ] **GitHub OAuth App created**
  - [ ] App created at https://github.com/settings/applications/new
  - [ ] Homepage URL: `https://your-app.vercel.app`
  - [ ] Callback URL: `https://your-app.vercel.app/api/webhook/github/callback`

---

## 🎯 Post-Deployment Checklist

### Basic Functionality
- [ ] **App loads at Vercel URL**
  - [ ] No 404 errors
  - [ ] Assets load correctly
  - [ ] No console errors

- [ ] **Sign in with GitHub works**
  - [ ] OAuth flow completes successfully
  - [ ] User redirected to dashboard
  - [ ] User profile loads correctly

### Core Features
- [ ] **Dashboard loads repos**
  - [ ] Repository list appears
  - [ ] No loading errors
  - [ ] UI renders correctly

- [ ] **Connect a test repo**
  - [ ] GitHub integration works
  - [ ] Repository appears in dashboard
  - [ ] Webhook configured automatically

- [ ] **Trigger a GitHub Actions run**
  - [ ] Push to test repository
  - [ ] Actions workflow starts
  - [ ] Pipeline appears in Fixr

### Webhook & Notifications
- [ ] **Verify webhook received (check Vercel function logs)**
  - [ ] Check Vercel Functions tab for logs
  - [ ] Webhook payload received successfully
  - [ ] No authentication errors

- [ ] **AI analysis triggers**
  - [ ] Failed pipeline triggers analysis
  - [ ] AI suggestions generated
  - [ ] Fix applied successfully

- [ ] **Email notification received**
  - [ ] Test email sent successfully
  - [ ] Email arrives in inbox
  - [ ] Content displays correctly

### Advanced Features
- [ ] **Team collaboration works**
  - [ ] Create new team
  - [ ] Invite team members
  - [ ] Role-based permissions work

- [ ] **Analytics dashboard loads**
  - [ ] Charts render correctly
  - [ ] Data aggregates properly
  - [ ] Date filters work

- [ ] **Real-time notifications work**
  - [ ] Bell icon shows unread count
  - [ ] Notifications appear in real-time
  - [ ] Toast notifications display

### Monitoring & Logs
- [ ] **Check Vercel function logs for errors**
  - [ ] All API endpoints responding
  - [ ] No database connection errors
  - [ ] No authentication failures

---

## 🔧 GitHub Setup Checklist

### OAuth Configuration
- [ ] **OAuth callback URL updated**
  - [ ] Production URL: `https://your-app.vercel.app/api/webhook/github/callback`
  - [ ] Development URL: `http://localhost:3000/api/webhook/github/callback`

### Webhook Configuration
- [ ] **Webhook URLs updated in test repo**
  - [ ] Payload URL: `https://your-app.vercel.app/api/webhook/github`
  - [ ] Content type: `application/json`
  - [ ] Secret: Matches `GITHUB_WEBHOOK_SECRET` env var

- [ ] **Test webhook redelivery from GitHub**
  - [ ] Go to repository Settings > Webhooks
  - [ ] Click "Redeliver" on recent webhook
  - [ ] Verify receipt in Vercel logs

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Database Connection Failed
```bash
# Test connection locally
curl https://your-app.vercel.app/api/health/database

# Check DATABASE_URL format
# Should include: ?sslmode=require for Neon
```

#### Clerk Authentication Issues
- Verify allowed origins include production URL
- Check NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY matches environment
- Ensure Clerk secret key is correct

#### GitHub Webhook Issues
- Verify webhook URL is accessible
- Check webhook secret matches environment
- Ensure GitHub Actions workflow exists

#### Build Failures
```bash
# Check TypeScript errors
npm run type-check

# Check linting issues
npm run lint

# Build locally first
npm run build
```

#### Missing Environment Variables
- Check Vercel Environment Variables tab
- Ensure all required vars are present
- Verify no typos in variable names

---

## 📊 Performance Monitoring

### After Deployment
- [ ] **Vercel Analytics configured**
  - [ ] Track page views and user behavior
  - [ ] Monitor Core Web Vitals
  - [ ] Check error rates

- [ ] **Database performance monitored**
  - [ ] Check Neon dashboard for slow queries
  - [ ] Monitor connection pool usage
  - [ ] Set up alerts for high usage

---

## ✅ Final Verification

### Production Readiness
- [ ] All checklist items completed
- [ ] Team has tested core functionality
- [ ] Monitoring and alerts configured
- [ ] Backup and recovery plan documented
- [ ] Rollback plan prepared

### Launch Checklist
- [ ] DNS configured (if using custom domain)
- [ ] SSL certificate active
- [ ] Email templates tested
- [ ] User onboarding flow tested
- [ ] Support documentation ready

---

## 🆘 Emergency Contacts & Resources

### Support Links
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Console](https://console.neon.tech/)
- [Firebase Console](https://console.firebase.google.com/)
- [GitHub Developer Settings](https://github.com/settings/developers)

### Rollback Commands
```bash
# If deployment fails, rollback:
vercel rollback [deployment-url]

# Or redeploy previous working version:
git checkout [previous-commit]
vercel --prod
```

---

**🎉 Once all items are checked, your Fixr app is production-ready!**
