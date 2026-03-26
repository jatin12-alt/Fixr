-- Add missing columns to repos table
ALTER TABLE "repos" ADD COLUMN IF NOT EXISTS "auto_fix_enabled" boolean DEFAULT false;
ALTER TABLE "repos" ADD COLUMN IF NOT EXISTS "health_status" text DEFAULT 'pending';
ALTER TABLE "repos" ADD COLUMN IF NOT EXISTS "last_scan_at" timestamp;

-- Fix user_id column type (should be text, not integer)
-- This might need manual intervention if data exists
-- ALTER TABLE "repos" ALTER COLUMN "user_id" TYPE text USING user_id::text;
