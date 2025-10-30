-- Add UWaterloo verification field to offers table
ALTER TABLE public.offers
ADD COLUMN IF NOT EXISTS verified_uwaterloo BOOLEAN DEFAULT false;

-- Create index for verified offers queries
CREATE INDEX IF NOT EXISTS idx_offers_verified_uwaterloo ON public.offers(verified_uwaterloo);

-- Update the my_offers view to include verification status
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
  verified_uwaterloo,
  created_at,
  updated_at
FROM public.offers
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
