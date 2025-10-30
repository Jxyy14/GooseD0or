-- EMERGENCY: Database-level rate limiting to stop bots NOW
-- This prevents rapid-fire submissions at the database level

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_created_at 
  ON public.rate_limit_log(created_at DESC);

-- Function to check rate limit before INSERT
CREATE OR REPLACE FUNCTION check_offer_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_submissions_count INTEGER;
  very_recent_count INTEGER;
BEGIN
  -- Count submissions in last 1 minute
  SELECT COUNT(*) INTO very_recent_count
  FROM public.rate_limit_log
  WHERE event_type = 'offer_submission'
    AND created_at > NOW() - INTERVAL '1 minute';
  
  -- If more than 5 submissions per minute globally, block
  IF very_recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Too many submissions. Please try again in a few minutes.';
  END IF;
  
  -- Count submissions in last 5 minutes
  SELECT COUNT(*) INTO recent_submissions_count
  FROM public.rate_limit_log
  WHERE event_type = 'offer_submission'
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  -- If more than 15 submissions per 5 minutes globally, block
  IF recent_submissions_count >= 15 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  -- Log this submission attempt
  INSERT INTO public.rate_limit_log (event_type) 
  VALUES ('offer_submission');
  
  -- Clean up old logs (keep last hour only)
  DELETE FROM public.rate_limit_log 
  WHERE created_at < NOW() - INTERVAL '1 hour';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to offers table to enforce rate limiting
DROP TRIGGER IF EXISTS enforce_offer_rate_limit ON public.offers;
CREATE TRIGGER enforce_offer_rate_limit
  BEFORE INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION check_offer_rate_limit();

-- Function to detect and block duplicate company spam
CREATE OR REPLACE FUNCTION check_company_spam()
RETURNS TRIGGER AS $$
DECLARE
  recent_same_company INTEGER;
BEGIN
  -- Check if same company submitted multiple times in last 2 minutes
  SELECT COUNT(*) INTO recent_same_company
  FROM public.offers
  WHERE company_name ILIKE NEW.company_name
    AND created_at > NOW() - INTERVAL '2 minutes';
  
  -- If same company has 3+ submissions in 2 minutes, likely spam
  IF recent_same_company >= 3 THEN
    -- Flag as spam
    NEW.flagged_as_spam := true;
    
    -- Optional: Uncomment to block completely instead of flagging
    -- RAISE EXCEPTION 'Duplicate company submissions detected. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for company spam detection
DROP TRIGGER IF EXISTS detect_company_spam ON public.offers;
CREATE TRIGGER detect_company_spam
  BEFORE INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION check_company_spam();

-- Allow rate_limit_log to be managed
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rate limits"
  ON public.rate_limit_log
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert rate limits"
  ON public.rate_limit_log
  FOR INSERT
  WITH CHECK (true);

-- Add comment
COMMENT ON FUNCTION check_offer_rate_limit IS 
  'Database-level rate limiting: Max 5 submissions/minute, 15 submissions/5 minutes globally';

COMMENT ON FUNCTION check_company_spam IS 
  'Detects and flags/blocks duplicate company submissions (3+ in 2 minutes)';


