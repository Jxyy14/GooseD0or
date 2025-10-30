-- Add validation limits to prevent troll submissions
-- Max salary: $300/hour
-- Max review length: 150 words

-- Function to count words in text
CREATE OR REPLACE FUNCTION count_words(text_input TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF text_input IS NULL OR text_input = '' THEN
    RETURN 0;
  END IF;
  
  -- Count words by splitting on whitespace
  RETURN array_length(regexp_split_to_array(trim(text_input), '\s+'), 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate offer submissions
CREATE OR REPLACE FUNCTION validate_offer_submission()
RETURNS TRIGGER AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Validate salary (max $300/hour)
  IF NEW.salary_hourly > 300 THEN
    RAISE EXCEPTION 'Invalid salary: Maximum hourly rate is $300/hour. Got: $%', NEW.salary_hourly
      USING HINT = 'Please enter a realistic co-op hourly rate';
  END IF;
  
  -- Validate salary is positive
  IF NEW.salary_hourly <= 0 THEN
    RAISE EXCEPTION 'Invalid salary: Hourly rate must be greater than $0. Got: $%', NEW.salary_hourly;
  END IF;
  
  -- Validate salary is reasonable minimum (at least $10/hour)
  IF NEW.salary_hourly < 10 THEN
    RAISE EXCEPTION 'Invalid salary: Hourly rate seems too low. Minimum $10/hour expected. Got: $%', NEW.salary_hourly
      USING HINT = 'If this is accurate, please contact support';
  END IF;
  
  -- Validate review text word count (max 150 words)
  IF NEW.review_text IS NOT NULL AND NEW.review_text != '' THEN
    word_count := count_words(NEW.review_text);
    
    IF word_count > 150 THEN
      RAISE EXCEPTION 'Review too long: Maximum 150 words allowed. Your review has % words', word_count
        USING HINT = 'Please shorten your review to 150 words or less';
    END IF;
  END IF;
  
  -- Validate company name is not empty or just whitespace
  IF trim(NEW.company_name) = '' THEN
    RAISE EXCEPTION 'Company name cannot be empty';
  END IF;
  
  -- Validate company name length (max 100 chars, min 2 chars)
  IF length(trim(NEW.company_name)) < 2 THEN
    RAISE EXCEPTION 'Company name too short: Minimum 2 characters required';
  END IF;
  
  IF length(NEW.company_name) > 100 THEN
    RAISE EXCEPTION 'Company name too long: Maximum 100 characters allowed';
  END IF;
  
  -- Validate role title
  IF trim(NEW.role_title) = '' THEN
    RAISE EXCEPTION 'Role title cannot be empty';
  END IF;
  
  IF length(NEW.role_title) > 100 THEN
    RAISE EXCEPTION 'Role title too long: Maximum 100 characters allowed';
  END IF;
  
  -- Validate location
  IF trim(NEW.location) = '' THEN
    RAISE EXCEPTION 'Location cannot be empty';
  END IF;
  
  IF length(NEW.location) > 100 THEN
    RAISE EXCEPTION 'Location too long: Maximum 100 characters allowed';
  END IF;
  
  -- Validate experience rating is between 1-5
  IF NEW.experience_rating < 1 OR NEW.experience_rating > 5 THEN
    RAISE EXCEPTION 'Invalid rating: Must be between 1 and 5. Got: %', NEW.experience_rating;
  END IF;
  
  -- Block suspicious patterns (all caps company names likely trolls)
  IF NEW.company_name = upper(NEW.company_name) AND length(NEW.company_name) > 3 THEN
    -- Allow common acronyms like IBM, AWS, etc (short names)
    IF length(NEW.company_name) > 10 THEN
      NEW.flagged_as_spam := true;
    END IF;
  END IF;
  
  -- Flag if review contains excessive special characters (likely spam)
  IF NEW.review_text IS NOT NULL THEN
    IF length(regexp_replace(NEW.review_text, '[a-zA-Z0-9\s]', '', 'g')) > length(NEW.review_text) * 0.3 THEN
      NEW.flagged_as_spam := true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_offer_before_insert ON public.offers;

-- Add trigger to validate offers before insertion
CREATE TRIGGER validate_offer_before_insert
  BEFORE INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION validate_offer_submission();

-- Also validate on updates
DROP TRIGGER IF EXISTS validate_offer_before_update ON public.offers;

CREATE TRIGGER validate_offer_before_update
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION validate_offer_submission();

-- Add constraints at table level as backup
ALTER TABLE public.offers
  DROP CONSTRAINT IF EXISTS check_salary_max,
  DROP CONSTRAINT IF EXISTS check_salary_min,
  DROP CONSTRAINT IF EXISTS check_company_name_length,
  DROP CONSTRAINT IF EXISTS check_role_title_length,
  DROP CONSTRAINT IF EXISTS check_location_length;

ALTER TABLE public.offers
  ADD CONSTRAINT check_salary_max CHECK (salary_hourly <= 300),
  ADD CONSTRAINT check_salary_min CHECK (salary_hourly >= 10),
  ADD CONSTRAINT check_company_name_length CHECK (length(trim(company_name)) >= 2 AND length(company_name) <= 100),
  ADD CONSTRAINT check_role_title_length CHECK (length(trim(role_title)) >= 1 AND length(role_title) <= 100),
  ADD CONSTRAINT check_location_length CHECK (length(trim(location)) >= 1 AND length(location) <= 100);

-- Add helpful comments
COMMENT ON FUNCTION validate_offer_submission IS 
  'Validates offer submissions: max $300/hour salary, max 150 word review, reasonable field lengths, spam detection';

COMMENT ON FUNCTION count_words IS 
  'Counts words in text by splitting on whitespace';

-- Create a view for admins to see flagged submissions
CREATE OR REPLACE VIEW public.flagged_submissions AS
SELECT 
  id,
  company_name,
  role_title,
  salary_hourly,
  experience_rating,
  review_text,
  created_at,
  CASE 
    WHEN flagged_as_spam THEN 'Flagged as spam'
    ELSE 'Clean'
  END as status
FROM public.offers
WHERE flagged_as_spam = true
ORDER BY created_at DESC;

-- Allow viewing flagged submissions
ALTER VIEW public.flagged_submissions SET (security_barrier = false);

COMMENT ON VIEW public.flagged_submissions IS 
  'View of all submissions flagged as spam for admin review';

