-- Add 6 sample offers from different universities
-- Note: These use dummy user_ids. In production, these would be real user IDs.

-- Sample Offer 1: UWaterloo - Google
INSERT INTO public.offers (
  company_name,
  role_title,
  location,
  salary_hourly,
  currency,
  tech_stack,
  experience_rating,
  review_text,
  term,
  job_type,
  level,
  work_type,
  university,
  verified_uwaterloo,
  user_id,
  user_email
) VALUES (
  'Google',
  'Software Engineer Intern',
  'Mountain View, CA',
  65.00,
  'USD',
  ARRAY['Python', 'Go', 'Kubernetes', 'TensorFlow'],
  5,
  'Amazing culture and great mentorship. Got to work on production systems with millions of users. Free food was incredible! Team was very welcoming and I learned so much about distributed systems.',
  'Summer 2024',
  'SWE',
  'Junior',
  'Hybrid',
  'University of Waterloo',
  true,
  '00000000-0000-0000-0000-000000000001',
  'sample1@uwaterloo.ca'
);

-- Sample Offer 2: UC Berkeley - Meta
INSERT INTO public.offers (
  company_name,
  role_title,
  location,
  salary_hourly,
  currency,
  tech_stack,
  experience_rating,
  review_text,
  term,
  job_type,
  level,
  work_type,
  university,
  verified_uwaterloo,
  user_id,
  user_email
) VALUES (
  'Meta',
  'Machine Learning Engineer Intern',
  'Menlo Park, CA',
  68.00,
  'USD',
  ARRAY['PyTorch', 'Python', 'C++', 'React'],
  4,
  'Great compensation and perks. Worked on recommendation systems for Instagram. The codebase was huge and sometimes overwhelming. Good WLB though.',
  'Fall 2024',
  'ML',
  'Returning Co-op',
  'Onsite',
  'University of California, Berkeley',
  false,
  '00000000-0000-0000-0000-000000000002',
  'sample2@berkeley.edu'
);

-- Sample Offer 3: UChicago - Citadel
INSERT INTO public.offers (
  company_name,
  role_title,
  location,
  salary_hourly,
  currency,
  tech_stack,
  experience_rating,
  review_text,
  term,
  job_type,
  level,
  work_type,
  university,
  verified_uwaterloo,
  user_id,
  user_email
) VALUES (
  'Citadel',
  'Quantitative Researcher Intern',
  'Chicago, IL',
  85.00,
  'USD',
  ARRAY['Python', 'C++', 'NumPy', 'Pandas'],
  5,
  'Extremely competitive and fast-paced. The pay is outstanding. Got to work on real trading strategies. Very intense but learned a ton about quantitative finance. Long hours but worth it for the experience.',
  'Summer 2024',
  'Quant',
  'Junior',
  'Onsite',
  'University of Chicago',
  false,
  '00000000-0000-0000-0000-000000000003',
  'sample3@uchicago.edu'
);

-- Sample Offer 4: UCLA - Amazon
INSERT INTO public.offers (
  company_name,
  role_title,
  location,
  salary_hourly,
  currency,
  tech_stack,
  experience_rating,
  review_text,
  term,
  job_type,
  level,
  work_type,
  university,
  verified_uwaterloo,
  user_id,
  user_email
) VALUES (
  'Amazon',
  'Software Development Engineer Intern',
  'Seattle, WA',
  52.00,
  'USD',
  ARRAY['Java', 'AWS', 'DynamoDB', 'Lambda'],
  3,
  'Good learning experience but very team dependent. My team was okay but heard others had better experiences. The work was interesting but sometimes felt like grunt work. Compensation was decent.',
  'Winter 2025',
  'SWE',
  'Junior',
  'Hybrid',
  'University of California, Los Angeles',
  false,
  '00000000-0000-0000-0000-000000000004',
  'sample4@ucla.edu'
);

-- Sample Offer 5: Purdue - Microsoft
INSERT INTO public.offers (
  company_name,
  role_title,
  location,
  salary_hourly,
  currency,
  tech_stack,
  experience_rating,
  review_text,
  term,
  job_type,
  level,
  work_type,
  university,
  verified_uwaterloo,
  user_id,
  user_email
) VALUES (
  'Microsoft',
  'Software Engineer Intern',
  'Redmond, WA',
  58.00,
  'USD',
  ARRAY['C#', 'Azure', 'TypeScript', 'React'],
  4,
  'Great work-life balance and supportive team. Got to ship a feature that went to production. The campus is beautiful and there are lots of intern events. Would definitely recommend!',
  'Summer 2024',
  'SWE',
  'Returning Co-op',
  'Hybrid',
  'Purdue University',
  false,
  '00000000-0000-0000-0000-000000000005',
  'sample5@purdue.edu'
);

-- Sample Offer 6: UWaterloo - Shopify
INSERT INTO public.offers (
  company_name,
  role_title,
  location,
  salary_hourly,
  currency,
  tech_stack,
  experience_rating,
  review_text,
  term,
  job_type,
  level,
  work_type,
  university,
  verified_uwaterloo,
  user_id,
  user_email
) VALUES (
  'Shopify',
  'Data Engineer Intern',
  'Ottawa, ON',
  42.00,
  'CAD',
  ARRAY['Python', 'Spark', 'Kafka', 'PostgreSQL'],
  4,
  'Really enjoyed the startup culture even though they are big now. Got a lot of ownership over my project. The team was super helpful and I got to work with modern data engineering tools.',
  'Fall 2024',
  'DS',
  'Junior',
  'Remote',
  'University of Waterloo',
  true,
  '00000000-0000-0000-0000-000000000006',
  'sample6@uwaterloo.ca'
);

