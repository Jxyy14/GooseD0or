-- Fix function search path security warning by dropping triggers first
DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
DROP TRIGGER IF EXISTS update_company_summaries_updated_at ON public.company_summaries;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_summaries_updated_at
  BEFORE UPDATE ON public.company_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();