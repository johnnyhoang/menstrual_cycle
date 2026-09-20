-- ==============================================================================
-- Mom Health Atlas: Supabase Database Schema (Prefix: mh_)
-- ==============================================================================

-- 1. Table: Menstrual Cycles History (mh_menstrual_cycles)
CREATE TABLE IF NOT EXISTS public.mh_menstrual_cycles (
  id TEXT PRIMARY KEY,
  user_email TEXT DEFAULT 'thuynga126@gmail.com',
  start_date TEXT NOT NULL,
  end_date TEXT,
  date_range_display TEXT NOT NULL,
  year INTEGER NOT NULL,
  cycle_length_days INTEGER NOT NULL,
  period_duration_days INTEGER NOT NULL,
  cycle_type TEXT DEFAULT 'normal_long',
  cycle_type_label TEXT,
  clinical_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mh_menstrual_cycles ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT 'thuynga126@gmail.com';

-- Enable RLS and create open policy for anon access
ALTER TABLE public.mh_menstrual_cycles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon on mh_menstrual_cycles" ON public.mh_menstrual_cycles;
CREATE POLICY "Allow all for anon on mh_menstrual_cycles" 
ON public.mh_menstrual_cycles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Index for efficient sorting & filtering by year and start date
CREATE INDEX IF NOT EXISTS idx_mh_cycles_year ON public.mh_menstrual_cycles (year DESC);
CREATE INDEX IF NOT EXISTS idx_mh_cycles_email ON public.mh_menstrual_cycles (user_email);

-- 2. Table: Daily Symptoms & Physical Logs (mh_daily_logs)
CREATE TABLE IF NOT EXISTS public.mh_daily_logs (
  date TEXT PRIMARY KEY, -- e.g. "15/09/2026"
  user_email TEXT DEFAULT 'thuynga126@gmail.com',
  day_of_week TEXT,
  cycle_day_text TEXT,
  cycle_day_number INTEGER,
  phase TEXT DEFAULT 'secretory',
  phase_label TEXT,
  summary TEXT NOT NULL,
  symptoms JSONB DEFAULT '[]'::jsonb,
  discharge_type TEXT DEFAULT 'none',
  discharge_label TEXT,
  pain_level TEXT DEFAULT 'none',
  pain_description TEXT,
  event_note TEXT,
  clinical_interpretation TEXT,
  is_key_milestone BOOLEAN DEFAULT false,
  has_intercourse BOOLEAN DEFAULT false,
  intercourse_protection TEXT,
  intercourse_orgasm BOOLEAN,
  intercourse_count INTEGER DEFAULT 1,
  intercourse_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration helpers if table already exists
ALTER TABLE public.mh_daily_logs ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT 'thuynga126@gmail.com';
ALTER TABLE public.mh_daily_logs ADD COLUMN IF NOT EXISTS has_intercourse BOOLEAN DEFAULT false;
ALTER TABLE public.mh_daily_logs ADD COLUMN IF NOT EXISTS intercourse_protection TEXT;
ALTER TABLE public.mh_daily_logs ADD COLUMN IF NOT EXISTS intercourse_orgasm BOOLEAN;
ALTER TABLE public.mh_daily_logs ADD COLUMN IF NOT EXISTS intercourse_count INTEGER DEFAULT 1;
ALTER TABLE public.mh_daily_logs ADD COLUMN IF NOT EXISTS intercourse_note TEXT;

-- Enable RLS for daily logs
ALTER TABLE public.mh_daily_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon on mh_daily_logs" ON public.mh_daily_logs;
CREATE POLICY "Allow all for anon on mh_daily_logs" 
ON public.mh_daily_logs 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Index for querying milestone days & discharge types
CREATE INDEX IF NOT EXISTS idx_mh_logs_milestone ON public.mh_daily_logs (is_key_milestone);
CREATE INDEX IF NOT EXISTS idx_mh_logs_discharge ON public.mh_daily_logs (discharge_type);
CREATE INDEX IF NOT EXISTS idx_mh_logs_email ON public.mh_daily_logs (user_email);

-- 3. Table: App & Patient Clinical Settings (mh_app_settings)
CREATE TABLE IF NOT EXISTS public.mh_app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mh_app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon on mh_app_settings" ON public.mh_app_settings;
CREATE POLICY "Allow all for anon on mh_app_settings" 
ON public.mh_app_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);
