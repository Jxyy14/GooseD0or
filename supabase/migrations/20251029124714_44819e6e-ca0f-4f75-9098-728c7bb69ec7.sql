-- Add new columns to offers table for categorization and verification
ALTER TABLE offers 
ADD COLUMN job_type text,
ADD COLUMN level text,
ADD COLUMN work_type text,
ADD COLUMN is_verified boolean DEFAULT false,
ADD COLUMN verification_token text,
ADD COLUMN verified_at timestamp with time zone;

-- Add check constraints for the new fields
ALTER TABLE offers
ADD CONSTRAINT job_type_check 
CHECK (job_type IN ('SWE', 'PM', 'ML', 'DS', 'Quant', 'IT', 'Other')),
ADD CONSTRAINT level_check 
CHECK (level IN ('Junior', 'Returning Co-op', 'Grad Pipeline')),
ADD CONSTRAINT work_type_check 
CHECK (work_type IN ('Remote', 'Hybrid', 'Onsite'));