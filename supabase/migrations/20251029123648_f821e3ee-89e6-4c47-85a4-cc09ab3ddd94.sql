-- Create blacklisted_companies table
CREATE TABLE IF NOT EXISTS public.blacklisted_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  reported_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blacklisted_companies ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view blacklisted companies
CREATE POLICY "Anyone can view blacklisted companies"
  ON public.blacklisted_companies
  FOR SELECT
  USING (true);

-- Allow anyone to submit blacklisted companies
CREATE POLICY "Anyone can submit blacklisted companies"
  ON public.blacklisted_companies
  FOR INSERT
  WITH CHECK (true);

-- Create index on company_name
CREATE INDEX idx_blacklisted_companies_name ON public.blacklisted_companies(company_name);

-- Add trigger for updated_at
CREATE TRIGGER update_blacklisted_companies_updated_at
  BEFORE UPDATE ON public.blacklisted_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();