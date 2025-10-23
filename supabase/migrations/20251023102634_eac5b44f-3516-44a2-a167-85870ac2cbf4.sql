-- Add default value for coach_type to prevent future errors
ALTER TABLE conversations 
ALTER COLUMN coach_type SET DEFAULT 'alex';

-- Clean up any conversations with NULL coach_type (shouldn't exist after previous migrations)
DELETE FROM conversations WHERE coach_type IS NULL;