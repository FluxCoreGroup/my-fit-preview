-- Add data_consent column to conversations table
-- NULL = awaiting consent, true = authorized, false = declined
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS data_consent boolean DEFAULT NULL;