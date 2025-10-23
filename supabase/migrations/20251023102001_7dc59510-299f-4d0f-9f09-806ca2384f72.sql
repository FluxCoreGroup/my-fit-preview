-- Add coach_type column to conversations table
ALTER TABLE conversations 
ADD COLUMN coach_type TEXT CHECK (coach_type IN ('alex', 'julie'));

-- Delete all existing conversations to start fresh
DELETE FROM conversations;

-- Make coach_type NOT NULL for new conversations
ALTER TABLE conversations 
ALTER COLUMN coach_type SET NOT NULL;