-- Add waist_circumference column to weight_logs table
ALTER TABLE public.weight_logs 
ADD COLUMN waist_circumference integer;

COMMENT ON COLUMN public.weight_logs.waist_circumference IS 'Tour de taille en cm';