# 🛡️ Protect Against Accidental Deletes

## What Happened

You accidentally deleted all offers in the Supabase Table Editor. On the free tier without backups, **this data cannot be recovered**. I'm sorry 😔

---

## ✅ PREVENT THIS FROM EVER HAPPENING AGAIN

I've created a comprehensive protection system:

### **1. Soft Deletes** (Most Important)
- Data is NEVER actually deleted
- Instead, it's marked as `deleted_at = NOW()`
- You can always recover "deleted" data
- Old deleted data can be permanently purged after 30 days

### **2. Full Audit Logging**
- Every INSERT, UPDATE, DELETE is logged
- Includes complete before/after snapshots
- You can see who changed what and when
- Can potentially recover deleted data from logs

### **3. Manual Backup Snapshots**
- Create backups before risky operations
- Stored in database as JSON
- Quick to restore from

---

## 🚀 Apply the Protection NOW

### Step 1: Apply the Migration

**In Supabase Dashboard:**
1. Go to SQL Editor
2. Copy/paste entire contents of:
   `supabase/migrations/20251029143000_soft_deletes_and_protection.sql`
3. Click **Run**

### Step 2: Verify It Worked

```sql
-- Check soft delete column exists
SELECT deleted_at, deleted_by FROM public.offers LIMIT 1;

-- Check audit log table exists
SELECT COUNT(*) FROM public.offers_audit_log;

-- Check views exist
SELECT COUNT(*) FROM public.offers_active;
```

---

## 📖 How to Use Soft Deletes

### ❌ OLD WAY (Dangerous):
```sql
-- DON'T DO THIS - Permanently deletes!
DELETE FROM public.offers WHERE id = 'some-id';
```

### ✅ NEW WAY (Safe):
```sql
-- Do this instead - Marks as deleted, can be recovered
SELECT soft_delete_offer('some-id-here');

-- To restore a deleted offer:
SELECT restore_offer('some-id-here');

-- To view deleted offers:
SELECT * FROM public.offers_deleted;
```

---

## 🔍 Using the Audit Log

### See All Changes:
```sql
-- View all changes in last 24 hours
SELECT 
  action,
  offer_id,
  old_data->>'company_name' as company_name,
  changed_at
FROM public.offers_audit_log
WHERE changed_at > NOW() - INTERVAL '24 hours'
ORDER BY changed_at DESC;
```

### Recover Deleted Data from Audit Log:
```sql
-- See what was deleted
SELECT 
  offer_id,
  old_data,
  changed_at
FROM public.offers_audit_log
WHERE action = 'DELETE'
ORDER BY changed_at DESC;

-- To recover specific deleted offer:
INSERT INTO public.offers (
  id,
  company_name,
  role_title,
  location,
  salary_hourly,
  tech_stack,
  experience_rating,
  review_text,
  program,
  year_of_study,
  term,
  created_at
)
SELECT 
  (old_data->>'id')::uuid,
  old_data->>'company_name',
  old_data->>'role_title',
  old_data->>'location',
  (old_data->>'salary_hourly')::numeric,
  ARRAY(SELECT jsonb_array_elements_text(old_data->'tech_stack')),
  (old_data->>'experience_rating')::integer,
  old_data->>'review_text',
  old_data->>'program',
  old_data->>'year_of_study',
  old_data->>'term',
  (old_data->>'created_at')::timestamptz
FROM public.offers_audit_log
WHERE action = 'DELETE' 
  AND offer_id = 'your-offer-id-here'
LIMIT 1;
```

---

## 💾 Manual Backup Snapshots

### Create Backup Before Risky Operations:
```sql
-- Create a snapshot
SELECT create_backup_snapshot('before_deleting_spam_2025_10_30');

-- View all snapshots
SELECT 
  snapshot_name,
  snapshot_date,
  offer_count
FROM public.offers_backup_snapshots
ORDER BY snapshot_date DESC;

-- View snapshot data
SELECT data FROM public.offers_backup_snapshots 
WHERE snapshot_name = 'your_snapshot_name';
```

### Restore From Snapshot:
```sql
-- Get the snapshot
WITH snapshot_data AS (
  SELECT jsonb_array_elements(data) as offer_data
  FROM public.offers_backup_snapshots
  WHERE snapshot_name = 'before_deleting_spam_2025_10_30'
)
INSERT INTO public.offers
SELECT 
  (offer_data->>'id')::uuid,
  offer_data->>'company_name',
  offer_data->>'role_title',
  offer_data->>'location',
  (offer_data->>'salary_hourly')::numeric,
  ARRAY(SELECT jsonb_array_elements_text(offer_data->'tech_stack')),
  (offer_data->>'experience_rating')::integer,
  offer_data->>'review_text',
  offer_data->>'program',
  offer_data->>'year_of_study',
  offer_data->>'term',
  (offer_data->>'created_at')::timestamptz,
  (offer_data->>'updated_at')::timestamptz
FROM snapshot_data;
```

---

## 🔒 Disable Table Editor Delete Button (Optional)

To prevent accidental deletes in Table Editor:

1. Go to Supabase Dashboard
2. Database → Roles & Permissions
3. Create a read-only role for daily use
4. Only use admin role when necessary

Or upgrade to Pro for better user management.

---

## 🎯 Update Your Frontend (Important!)

Change your queries to use the `offers_active` view instead of `offers` table:

### Before:
```typescript
const { data } = await supabase.from("offers").select("*");
```

### After (only shows non-deleted offers):
```typescript
const { data } = await supabase.from("offers_active").select("*");

// Or continue using "offers" table but filter:
const { data } = await supabase
  .from("offers")
  .select("*")
  .is("deleted_at", null);
```

---

## 📊 Admin Dashboard Queries

### View Stats:
```sql
-- Total offers
SELECT COUNT(*) as total FROM public.offers WHERE deleted_at IS NULL;

-- Deleted offers (can be recovered)
SELECT COUNT(*) as deleted FROM public.offers WHERE deleted_at IS NOT NULL;

-- Recent deletions
SELECT 
  company_name,
  deleted_at,
  deleted_by
FROM public.offers
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC
LIMIT 10;
```

### Clean Up Old Soft-Deletes (After 30 Days):
```sql
-- Permanently delete offers that were soft-deleted 30+ days ago
SELECT permanently_delete_old_offers(30);
```

---

## ✅ Going Forward: Safe Workflow

**ALWAYS do this before deleting anything:**

```sql
-- Step 1: Create backup snapshot
SELECT create_backup_snapshot('before_cleanup_' || CURRENT_DATE);

-- Step 2: Test with SELECT first
SELECT * FROM public.offers WHERE company_name ILIKE '%shopify%';

-- Step 3: Count how many will be affected
SELECT COUNT(*) FROM public.offers WHERE company_name ILIKE '%shopify%';

-- Step 4: Use soft delete (can be recovered)
UPDATE public.offers 
SET deleted_at = NOW() 
WHERE company_name ILIKE '%shopify%';

-- Step 5: Review deleted items
SELECT * FROM public.offers_deleted LIMIT 10;

-- Step 6: If you made a mistake, restore
UPDATE public.offers 
SET deleted_at = NULL 
WHERE company_name ILIKE '%shopify%';

-- Step 7: Only permanently delete after confirming it's correct
-- (Don't do this immediately - wait a few days)
DELETE FROM public.offers WHERE deleted_at < NOW() - INTERVAL '7 days';
```

---

## 🚨 Emergency Recovery (If You Delete Again)

Even with soft deletes, if you **permanently delete** the rows:

```sql
-- Check audit log for deleted data
SELECT 
  old_data,
  changed_at
FROM public.offers_audit_log
WHERE action = 'DELETE'
  AND changed_at > NOW() - INTERVAL '1 hour'
ORDER BY changed_at DESC;

-- The old_data column contains the full deleted row!
-- You can recover it (see "Recover Deleted Data from Audit Log" above)
```

---

## 🎓 Summary

| Protection | What It Does | Status |
|-----------|--------------|--------|
| Soft Deletes | Never actually delete data | ✅ Ready to apply |
| Audit Logging | Track all changes with snapshots | ✅ Ready to apply |
| Manual Snapshots | Create backups before risky ops | ✅ Ready to apply |
| Active View | Frontend only sees non-deleted | ✅ Ready to apply |

**After applying**: Data can NEVER be lost again (unless you permanently delete AND clear audit logs)

---

## 💡 Consider Upgrading to Pro

**Supabase Pro** ($25/month):
- Point-in-Time Recovery (restore to any second in last 7 days)
- Daily automated backups (7 day retention)
- Better performance
- More storage
- Priority support

Worth it to prevent future heartbreak!

---

## Need Help?

Apply the migration now and test by:
1. Creating a test offer
2. Soft-deleting it
3. Viewing it in `offers_deleted`
4. Restoring it
5. Checking the audit log

You're now protected! 🛡️

