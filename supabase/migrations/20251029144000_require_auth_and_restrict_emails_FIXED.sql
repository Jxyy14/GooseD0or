-- Require authentication and restrict to .edu and @uwaterloo.ca emails only
-- FIXED VERSION: Works independently without requiring soft deletes migration

-- Function to validate email domain
CREATE OR REPLACE FUNCTION validate_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email ends with .edu or @uwaterloo.ca
  IF NOT (
    NEW.email ILIKE '%.edu' OR 
    NEW.email ILIKE '%@uwaterloo.ca'
  ) THEN
    RAISE EXCEPTION 'Only .edu and @uwaterloo.ca emails are allowed to sign up'
      USING HINT = 'Please use your university email address';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate email on user creation
DROP TRIGGER IF EXISTS validate_user_email ON auth.users;
CREATE TRIGGER validate_user_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_email_domain();

-- Update offers table to track which user submitted
ALTER TABLE public.offers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  university TEXT,
  verified_student BOOLEAN DEFAULT false,
  total_submissions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- System can insert profiles
CREATE POLICY "System can insert profiles"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, university)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email ILIKE '%@uwaterloo.ca' THEN 'University of Waterloo'
      WHEN NEW.email ILIKE '%.edu' THEN 'University'
      ELSE 'Unknown'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update RLS policies for offers - NOW REQUIRES AUTHENTICATION
DROP POLICY IF EXISTS "Anyone can view offers" ON public.offers;
DROP POLICY IF EXISTS "Anyone can submit offers" ON public.offers;
DROP POLICY IF EXISTS "Anyone can view active offers" ON public.offers;

-- Anyone can view all offers (reading is still public)
CREATE POLICY "Anyone can view offers"
  ON public.offers
  FOR SELECT
  USING (true);

-- Only authenticated users with .edu emails can submit offers
CREATE POLICY "Authenticated users can submit offers"
  ON public.offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Users can update their own offers
CREATE POLICY "Users can update own offers"
  ON public.offers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own offers
CREATE POLICY "Users can delete own offers"
  ON public.offers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to increment user submission count
CREATE OR REPLACE FUNCTION increment_user_submissions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET total_submissions = total_submissions + 1
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track submission count
DROP TRIGGER IF EXISTS track_user_submissions ON public.offers;
CREATE TRIGGER track_user_submissions
  AFTER INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_submissions();

-- Create view for user's own submissions
CREATE OR REPLACE VIEW public.my_offers AS
SELECT 
  id,
  company_name,
  role_title,
  location,
  salary_hourly,
  tech_stack,
  experience_rating,
  review_text,
  created_at,
  updated_at,
  flagged_as_spam
FROM public.offers
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Create leaderboard view (top contributors)
CREATE OR REPLACE VIEW public.user_leaderboard AS
SELECT 
  display_name,
  university,
  total_submissions,
  created_at as member_since
FROM public.user_profiles
WHERE total_submissions > 0
ORDER BY total_submissions DESC
LIMIT 50;

-- Allow viewing leaderboard publicly
CREATE POLICY "Anyone can view leaderboard data"
  ON public.user_profiles
  FOR SELECT
  USING (true);

-- Add helpful comments
COMMENT ON FUNCTION validate_email_domain IS 
  'Validates that user email is .edu or @uwaterloo.ca domain - prevents non-students from signing up';

COMMENT ON TABLE public.user_profiles IS 
  'User profiles for authenticated students - tracks submissions and verification status';

COMMENT ON VIEW public.my_offers IS 
  'Shows current authenticated user their own submissions';

COMMENT ON VIEW public.user_leaderboard IS 
  'Public leaderboard showing top contributors by submission count';

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_offers_user_id ON public.offers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

