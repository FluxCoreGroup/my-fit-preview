-- Fix nullable user_id columns to prevent RLS bypass and orphaned data
-- This migration makes user_id NOT NULL on all user-specific tables

-- First, clean up any existing NULL user_id records (if any)
-- In production, you may want to handle these records differently
DELETE FROM goals WHERE user_id IS NULL;
DELETE FROM feedback WHERE user_id IS NULL;
DELETE FROM sessions WHERE user_id IS NULL;
DELETE FROM subscriptions WHERE user_id IS NULL;
DELETE FROM weekly_checkins WHERE user_id IS NULL;

-- Now make user_id NOT NULL on all tables
ALTER TABLE goals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE feedback ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE weekly_checkins ALTER COLUMN user_id SET NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN goals.user_id IS 'User who owns this goal record. Must never be NULL.';
COMMENT ON COLUMN feedback.user_id IS 'User who submitted this feedback. Must never be NULL.';
COMMENT ON COLUMN sessions.user_id IS 'User who owns this training session. Must never be NULL.';
COMMENT ON COLUMN subscriptions.user_id IS 'User who owns this subscription. Must never be NULL.';
COMMENT ON COLUMN weekly_checkins.user_id IS 'User who submitted this check-in. Must never be NULL.';