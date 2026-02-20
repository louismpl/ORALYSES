-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Add subscription tracking to profiles
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add subscription tracking columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- subscription_status values:
--   'unpaid'    → never paid, just signed up
--   'active'    → currently paying
--   'on_trial'  → in free trial period
--   'cancelled' → cancelled but may still have access until subscription_ends_at
--   'expired'   → subscription ended, no access
--   'paused'    → subscription paused

-- Update existing users: those with plan 'pro' or 'cabinet' are assumed active
UPDATE profiles
SET subscription_status = 'active'
WHERE plan IN ('pro', 'cabinet')
  AND (subscription_status IS NULL OR subscription_status = 'unpaid');

-- Users with plan 'free' or null remain 'unpaid'
UPDATE profiles
SET subscription_status = 'unpaid'
WHERE (plan IS NULL OR plan = 'free')
  AND subscription_status IS NULL;

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(subscription_id);
