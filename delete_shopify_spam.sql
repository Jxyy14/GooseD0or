-- Script to delete 80% of the most recent Shopify submissions
-- Run this in your Supabase SQL Editor

-- Step 1: See how many Shopify submissions exist
SELECT 
  COUNT(*) as total_shopify_submissions,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM public.offers
WHERE company_name ILIKE '%shopify%';

-- Step 2: Preview which submissions will be KEPT (the oldest 20%)
WITH shopify_offers AS (
  SELECT 
    id,
    company_name,
    role_title,
    salary_hourly,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num,
    COUNT(*) OVER () as total_count
  FROM public.offers
  WHERE company_name ILIKE '%shopify%'
)
SELECT 
  id,
  company_name,
  role_title,
  created_at,
  'WILL BE KEPT' as status
FROM shopify_offers
WHERE row_num <= (total_count * 0.20)  -- Keep oldest 20%
ORDER BY created_at DESC;

-- Step 3: Preview which submissions will be DELETED (the newest 80%)
WITH shopify_offers AS (
  SELECT 
    id,
    company_name,
    role_title,
    salary_hourly,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num,
    COUNT(*) OVER () as total_count
  FROM public.offers
  WHERE company_name ILIKE '%shopify%'
)
SELECT 
  id,
  company_name,
  role_title,
  created_at,
  'WILL BE DELETED' as status
FROM shopify_offers
WHERE row_num > (total_count * 0.20)  -- Delete newest 80%
ORDER BY created_at DESC;

-- Step 4: Count how many will be deleted
WITH shopify_offers AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num,
    COUNT(*) OVER () as total_count
  FROM public.offers
  WHERE company_name ILIKE '%shopify%'
)
SELECT 
  COUNT(*) as will_be_deleted,
  (SELECT COUNT(*) FROM public.offers WHERE company_name ILIKE '%shopify%') as total_shopify,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.offers WHERE company_name ILIKE '%shopify%'), 1) as percentage
FROM shopify_offers
WHERE row_num > (total_count * 0.20);

-- Step 5: ACTUALLY DELETE 80% of the newest Shopify submissions
-- Review the preview above first, then uncomment and run this:

/*
WITH shopify_offers AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num,
    COUNT(*) OVER () as total_count
  FROM public.offers
  WHERE company_name ILIKE '%shopify%'
)
DELETE FROM public.offers
WHERE id IN (
  SELECT id 
  FROM shopify_offers 
  WHERE row_num > (total_count * 0.20)  -- Delete newest 80%
);
*/

-- Step 6: Verify the deletion worked (run after Step 5)
/*
SELECT 
  COUNT(*) as remaining_shopify_submissions,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM public.offers
WHERE company_name ILIKE '%shopify%';
*/

-- Alternative: Delete ALL Shopify from the last hour only (safer option)
-- Uncomment if you prefer this approach:
/*
DELETE FROM public.offers
WHERE company_name ILIKE '%shopify%'
  AND created_at > NOW() - INTERVAL '1 hour';
*/


