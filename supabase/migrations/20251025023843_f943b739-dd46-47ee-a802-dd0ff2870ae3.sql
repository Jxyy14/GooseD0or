-- Create offers table to store anonymous co-op offer submissions
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_hourly DECIMAL(10,2) NOT NULL,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  experience_rating INTEGER NOT NULL CHECK (experience_rating >= 1 AND experience_rating <= 5),
  review_text TEXT,
  program TEXT,
  year_of_study TEXT,
  term TEXT NOT NULL,
  sentiment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create company summaries table to cache AI-generated summaries
CREATE TABLE public.company_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  average_salary DECIMAL(10,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_summaries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read offers (public data)
CREATE POLICY "Anyone can view offers"
  ON public.offers
  FOR SELECT
  USING (true);

-- Allow anyone to insert offers (anonymous submissions)
CREATE POLICY "Anyone can submit offers"
  ON public.offers
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read company summaries
CREATE POLICY "Anyone can view company summaries"
  ON public.company_summaries
  FOR SELECT
  USING (true);

-- Allow anyone to insert/update company summaries (for AI generation)
CREATE POLICY "Anyone can manage company summaries"
  ON public.company_summaries
  FOR ALL
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_offers_company_name ON public.offers(company_name);
CREATE INDEX idx_offers_salary ON public.offers(salary_hourly);
CREATE INDEX idx_offers_rating ON public.offers(experience_rating);
CREATE INDEX idx_offers_term ON public.offers(term);
CREATE INDEX idx_offers_created_at ON public.offers(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for offers table
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for company_summaries table
CREATE TRIGGER update_company_summaries_updated_at
  BEFORE UPDATE ON public.company_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for offers table
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;