# Fixr Database Setup Guide

## 🚨 IMPORTANT: Database Migration Required

This project currently uses **Drizzle ORM** but we've added **Prisma ORM** support for the new team collaboration features. You have two options:

### Option A: Use Prisma (Recommended for Team Features)
The new team collaboration, notifications, and analytics features are built with Prisma.

### Option B: Stay with Drizzle
Keep your existing Drizzle setup (team features won't work).

---

## 📋 Prisma Setup Instructions

### 1. Install Dependencies
```bash
# Option 1: Run the setup script (Windows)
setup-prisma.bat

# Option 2: Run the setup script (Unix/Linux/Mac)
chmod +x setup-prisma.sh
./setup-prisma.sh

# Option 3: Manual installation
npm install prisma @prisma/client
```

### 2. Environment Setup
Copy the environment template:
```bash
cp .env.example .env.local
```

Update your `DATABASE_URL` in `.env.local`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fixr"
```

### 3. Generate Prisma Client
```bash
npm run db:prisma:generate
```

### 4. Create Database Migration
```bash
npm run db:prisma:migrate
```

### 5. Deploy to Production (Optional)
```bash
npm run db:prisma:deploy
```

### 6. Verify Setup
```bash
# Open Prisma Studio to view your database
npm run db:prisma:studio
```

---

## 🗄️ Database Schema

The Prisma schema includes:
- **Users** - Authentication and user profiles
- **Teams** - Multi-user team management
- **TeamMembers** - Team membership with roles
- **TeamInvites** - Email invitation system
- **Repositories** - GitHub repository connections
- **Notifications** - Real-time notifications
- **AuditLog** - Complete activity tracking
- **Pipelines** - CI/CD pipeline data

### Role Hierarchy
```
OWNER (100) > ADMIN (80) > MEMBER (50) > VIEWER (20)
```

---

## 🚀 Available Scripts

```bash
# Prisma Commands
npm run db:prisma:generate    # Generate Prisma client
npm run db:prisma:migrate     # Create and run migrations
npm run db:prisma:deploy      # Deploy migrations to production
npm run db:prisma:studio      # Open Prisma Studio

# Development
npm run dev                   # Start development server
npm run build                 # Build for production
npm run start                 # Start production server

# Existing Drizzle Commands (if needed)
npm run db:generate           # Generate Drizzle kit
npm run db:push               # Push Drizzle schema
```

---

## 🔧 Troubleshooting

### Common Issues

1. **"Cannot find module '@prisma/client'"**
   ```bash
   npm install @prisma/client
   npm run db:prisma:generate
   ```

2. **"Database connection failed"**
   - Check your `DATABASE_URL` in `.env.local`
   - Ensure PostgreSQL is running
   - Verify database exists

3. **"Migration failed"**
   ```bash
   # Reset and retry
   npx prisma migrate reset
   npm run db:prisma:migrate
   ```

4. **TypeScript errors in team routes**
   - Ensure Prisma client is generated: `npm run db:prisma:generate`
   - Check that `lib/db.ts` exists and imports Prisma correctly

---

## 📚 Next Steps

1. **Set up your database** with the steps above
2. **Configure Clerk authentication** in your environment
3. **Test team features** by creating a new team
4. **Set up email notifications** with Resend (optional)
5. **Configure push notifications** with VAPID keys (optional)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the console for specific error messages
2. Ensure all environment variables are set
3. Verify database connectivity
4. Run `npm run db:prisma:studio` to inspect your database

The team collaboration features will work once Prisma is properly set up and the database is migrated! 🚀
