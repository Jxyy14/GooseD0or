-- Add university field to offers table
ALTER TABLE public.offers
ADD COLUMN IF NOT EXISTS university TEXT;

-- Create index for university queries
CREATE INDEX IF NOT EXISTS idx_offers_university ON public.offers(university);

-- Update the my_offers view to include university
DROP VIEW IF EXISTS public.my_offers;
CREATE VIEW public.my_offers AS
SELECT 
  id,
  company_name,
  role_title,
  location,
  salary_hourly,
  tech_stack,
  experience_rating,
  review_text,
  university,
  created_at,
  updated_at
FROM public.offers
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
