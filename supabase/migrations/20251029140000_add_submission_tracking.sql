-- Add fields to track submissions and detect patterns
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS client_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS submission_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS flagged_as_spam BOOLEAN DEFAULT false;

-- Create table to track submission patterns
CREATE TABLE IF NOT EXISTS public.submission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_fingerprint TEXT NOT NULL,
  ip_hash TEXT, -- Store hashed IP for privacy
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  company_name TEXT,
  flagged BOOLEAN DEFAULT false,
  CONSTRAINT submission_logs_fingerprint_idx 
    CHECK (char_length(client_fingerprint) > 0)
);

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_submission_logs_fingerprint 
  ON public.submission_logs(client_fingerprint, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_submission_logs_ip_hash 
  ON public.submission_logs(ip_hash, submitted_at DESC);

-- Create index for spam detection
CREATE INDEX IF NOT EXISTS idx_offers_flagged_spam 
  ON public.offers(flagged_as_spam, created_at DESC);

-- Function to detect spam patterns
CREATE OR REPLACE FUNCTION detect_spam_pattern(
  check_company TEXT,
  check_fingerprint TEXT,
  time_window_minutes INTEGER DEFAULT 5
) RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
  same_company_count INTEGER;
BEGIN
  -- Count recent submissions from same fingerprint
  SELECT COUNT(*) INTO recent_count
  FROM public.submission_logs
  WHERE client_fingerprint = check_fingerprint
    AND submitted_at > NOW() - (time_window_minutes || ' minutes')::INTERVAL;
  
  -- If more than 5 submissions in time window, flag as spam
  IF recent_count >= 5 THEN
    RETURN true;
  END IF;
  
  -- Count same company submissions in short time
  SELECT COUNT(*) INTO same_company_count
  FROM public.submission_logs
  WHERE company_name = check_company
    AND submitted_at > NOW() - (time_window_minutes || ' minutes')::INTERVAL;
  
  -- If more than 10 of same company in 5 minutes, likely spam
  IF same_company_count >= 10 THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Allow anyone to read submission logs (for analytics)
ALTER TABLE public.submission_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view submission logs"
  ON public.submission_logs
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert submission logs"
  ON public.submission_logs
  FOR INSERT
  WITH CHECK (true);

-- Add comment explaining the spam detection
COMMENT ON FUNCTION detect_spam_pattern IS 
  'Detects potential spam patterns based on submission frequency and company name clustering';


