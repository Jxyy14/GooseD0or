-- Script to identify and clean up bot submissions
-- Run this carefully in your Supabase SQL editor

-- 1. First, let's see how many Shopify submissions we have in the last hour
SELECT 
  COUNT(*) as total_submissions,
  company_name,
  MIN(created_at) as first_submission,
  MAX(created_at) as last_submission,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as time_span_seconds
FROM public.offers
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY company_name
ORDER BY total_submissions DESC;

-- 2. Identify likely bot submissions (same company, many submissions in short time)
-- This query finds companies with more than 5 submissions in 5 minutes
WITH suspicious_submissions AS (
  SELECT 
    company_name,
    COUNT(*) as submission_count,
    MIN(created_at) as first_at,
    MAX(created_at) as last_at,
    ARRAY_AGG(id ORDER BY created_at) as offer_ids
  FROM public.offers
  WHERE created_at > NOW() - INTERVAL '1 hour'
  GROUP BY company_name
  HAVING COUNT(*) > 5 
    AND EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) < 300  -- 5 minutes
)
SELECT 
  company_name,
  submission_count,
  first_at,
  last_at,
  offer_ids
FROM suspicious_submissions
ORDER BY submission_count DESC;

-- 3. Flag suspicious submissions as spam (DON'T DELETE YET - review first)
-- Uncomment the following to flag them:
/*
UPDATE public.offers
SET flagged_as_spam = true
WHERE id IN (
  SELECT UNNEST(offer_ids)
  FROM (
    SELECT 
      ARRAY_AGG(id ORDER BY created_at) as offer_ids
    FROM public.offers
    WHERE created_at > NOW() - INTERVAL '1 hour'
      AND company_name ILIKE '%shopify%'  -- Adjust company name as needed
    GROUP BY company_name
    HAVING COUNT(*) > 5 
      AND EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) < 600
  ) suspicious
);
*/

-- 4. Review flagged submissions before deleting
SELECT 
  id,
  company_name,
  role_title,
  salary_hourly,
  created_at,
  flagged_as_spam
FROM public.offers
WHERE flagged_as_spam = true
ORDER BY created_at DESC
LIMIT 100;

-- 5. CAREFUL: Delete flagged spam submissions (only run after reviewing)
-- Uncomment to actually delete:
/*
DELETE FROM public.offers
WHERE flagged_as_spam = true;
*/

-- 6. Alternative: Delete specific Shopify spam from the last hour
-- Uncomment and adjust as needed:
/*
DELETE FROM public.offers
WHERE company_name ILIKE '%shopify%'
  AND created_at > NOW() - INTERVAL '1 hour'
  AND created_at < NOW() - INTERVAL '10 minutes';  -- Keep very recent in case legitimate
*/

-- 7. Check remaining offers count
SELECT COUNT(*) as remaining_offers FROM public.offers WHERE flagged_as_spam = false OR flagged_as_spam IS NULL;


