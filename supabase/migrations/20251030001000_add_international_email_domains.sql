-- Add support for .au, .ca, and .uk academic email domains

-- Update the email validation function to accept international domains
CREATE OR REPLACE FUNCTION validate_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email ends with academic domains from supported countries
  -- US: .edu
  -- Australia: .edu.au
  -- Canada: .ca
  -- UK: .ac.uk
  IF NOT (
    NEW.email ILIKE '%.edu' OR 
    NEW.email ILIKE '%.edu.au' OR
    NEW.email ILIKE '%.ca' OR
    NEW.email ILIKE '%.ac.uk'
  ) THEN
    RAISE EXCEPTION 'Only university emails are allowed (.edu, .edu.au, .ca, .ac.uk)'
      USING HINT = 'Please use your university email address';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the function comment
COMMENT ON FUNCTION validate_email_domain IS 
  'Validates that user email is from a university domain (.edu, .edu.au, .ca, .ac.uk) - prevents non-students from signing up';

