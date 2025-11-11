-- Créer la table de feedback pour les annulations/suppressions
CREATE TABLE IF NOT EXISTS public.cancellation_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('cancel_subscription', 'delete_account')),
  reason TEXT NOT NULL,
  additional_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour rechercher par user_id
CREATE INDEX idx_cancellation_feedback_user_id ON public.cancellation_feedback(user_id);

-- Enable RLS
ALTER TABLE public.cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies : L'utilisateur peut voir ses propres feedbacks
CREATE POLICY "Users can view their own feedback"
  ON public.cancellation_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies : L'utilisateur peut créer son feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.cancellation_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);