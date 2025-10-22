-- Create nutrition_logs table for daily meal tracking
CREATE TABLE nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  logged_at timestamp with time zone DEFAULT now(),
  meal_type text NOT NULL,
  food_description text NOT NULL,
  calories integer NOT NULL,
  protein integer,
  carbs integer,
  fats integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on nutrition_logs
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nutrition_logs
CREATE POLICY "Users can view own logs"
  ON nutrition_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON nutrition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON nutrition_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON nutrition_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create weight_logs table for weight tracking
CREATE TABLE weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  weight numeric NOT NULL,
  logged_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on weight_logs
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weight_logs
CREATE POLICY "Users can view own weight logs"
  ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
  ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);