-- Create users table (profiles)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  horizon TEXT,
  frequency INT,
  session_duration INT,
  location TEXT,
  equipment TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed BOOLEAN DEFAULT false,
  exercises JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  completed BOOLEAN,
  rpe INT,
  had_pain BOOLEAN,
  pain_zones TEXT[],
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create weekly check-ins table
CREATE TABLE public.weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  average_weight DECIMAL,
  sessions_planned INT,
  sessions_done INT,
  adherence_diet INT,
  hunger TEXT,
  energy TEXT,
  sleep TEXT,
  blockers TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  plan_type TEXT,
  started_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basiques)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view own data" ON public.goals FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can insert own data" ON public.goals FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can view own sessions" ON public.sessions FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can view own feedback" ON public.feedback FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can view own checkins" ON public.weekly_checkins FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt() ->> 'sub'));