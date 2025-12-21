-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Cron job 1: Process email queue every 15 minutes
SELECT cron.schedule(
  'process-email-queue-every-15-min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://nsowlnpntphxwykzbwmc.supabase.co/functions/v1/process-email-queue',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zb3dsbnBudHBoeHd5a3pid21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTcxMDIsImV4cCI6MjA3NjA5MzEwMn0.NlZlpw3NTdYJ-2wj2COJ4QUpZfUjZkD-0OmIS4ss99M"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Cron job 2: Send weekly digest every Sunday at 6 PM (18:00 UTC)
SELECT cron.schedule(
  'send-weekly-digest-sunday-18h',
  '0 18 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://nsowlnpntphxwykzbwmc.supabase.co/functions/v1/send-weekly-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zb3dsbnBudHBoeHd5a3pid21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTcxMDIsImV4cCI6MjA3NjA5MzEwMn0.NlZlpw3NTdYJ-2wj2COJ4QUpZfUjZkD-0OmIS4ss99M"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);