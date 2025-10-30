-- Add currency field to offers table
ALTER TABLE public.offers
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'CAD' CHECK (currency IN ('CAD', 'USD'));

-- Create index for currency queries
CREATE INDEX IF NOT EXISTS idx_offers_currency ON public.offers(currency);

-- Update existing records to have CAD as default currency
UPDATE public.offers 
SET currency = 'CAD' 
WHERE currency IS NULL;

-- Update the my_offers view to include currency
DROP VIEW IF EXISTS public.my_offers;
CREATE VIEW public.my_offers AS
SELECT 
  id,
  company_name,
  role_title,
  location,
  salary_hourly,
  currency,
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

