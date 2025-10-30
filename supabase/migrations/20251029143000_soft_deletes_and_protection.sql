-- PREVENT ACCIDENTAL DELETES: Implement soft deletes and audit logging
-- From now on, data won't actually be deleted - just marked as deleted

-- Add soft delete column to offers table
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;

-- Create audit log table to track ALL changes
CREATE TABLE IF NOT EXISTS public.offers_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_offers_audit_log_offer_id ON public.offers_audit_log(offer_id);
CREATE INDEX IF NOT EXISTS idx_offers_audit_log_action ON public.offers_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_offers_audit_log_changed_at ON public.offers_audit_log(changed_at DESC);

-- Function to log all changes to offers table
CREATE OR REPLACE FUNCTION log_offer_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.offers_audit_log (offer_id, action, old_data)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD)::jsonb);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.offers_audit_log (offer_id, action, old_data, new_data)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.offers_audit_log (offer_id, action, new_data)
    VALUES (NEW.id, 'INSERT', row_to_json(NEW)::jsonb);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add audit logging trigger (logs all changes)
DROP TRIGGER IF EXISTS audit_offers_changes ON public.offers;
CREATE TRIGGER audit_offers_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION log_offer_changes();

-- Create view that excludes soft-deleted offers (use this for queries)
CREATE OR REPLACE VIEW public.offers_active AS
SELECT 
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
  sentiment,
  created_at,
  updated_at,
  flagged_as_spam
FROM public.offers
WHERE deleted_at IS NULL;

-- Create view for deleted offers (admin can recover)
CREATE OR REPLACE VIEW public.offers_deleted AS
SELECT 
  id,
  company_name,
  role_title,
  location,
  salary_hourly,
  deleted_at,
  deleted_by,
  created_at
FROM public.offers
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- Function to soft delete offers (use this instead of DELETE)
CREATE OR REPLACE FUNCTION soft_delete_offer(offer_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.offers
  SET 
    deleted_at = NOW(),
    deleted_by = current_user
  WHERE id = offer_id
    AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to restore soft-deleted offers
CREATE OR REPLACE FUNCTION restore_offer(offer_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.offers
  SET 
    deleted_at = NULL,
    deleted_by = NULL
  WHERE id = offer_id
    AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to permanently delete old soft-deleted offers (run manually)
CREATE OR REPLACE FUNCTION permanently_delete_old_offers(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.offers
  WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for views
ALTER VIEW public.offers_active SET (security_barrier = false);
ALTER VIEW public.offers_deleted SET (security_barrier = false);

-- Allow reading active offers (public)
-- Note: You'll need to update your frontend to use offers_active view instead of offers table

-- Enable RLS on audit log
ALTER TABLE public.offers_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins should view audit logs (adjust as needed)
CREATE POLICY "Anyone can view audit logs"
  ON public.offers_audit_log
  FOR SELECT
  USING (true);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON public.offers_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Add helpful comments
COMMENT ON COLUMN public.offers.deleted_at IS 
  'Soft delete timestamp - when not null, the offer is considered deleted but can be recovered';

COMMENT ON VIEW public.offers_active IS 
  'View of all active (non-deleted) offers - use this in your frontend instead of the offers table';

COMMENT ON VIEW public.offers_deleted IS 
  'View of all soft-deleted offers - admins can review and restore these';

COMMENT ON FUNCTION soft_delete_offer IS 
  'Soft delete an offer by ID - marks as deleted without actually removing data';

COMMENT ON FUNCTION restore_offer IS 
  'Restore a soft-deleted offer by ID';

COMMENT ON TABLE public.offers_audit_log IS 
  'Complete audit trail of all changes to offers table - includes INSERT, UPDATE, DELETE with full data snapshots';

-- Create a backup snapshot table (for manual backups)
CREATE TABLE IF NOT EXISTS public.offers_backup_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_name TEXT NOT NULL,
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  offer_count INTEGER,
  data JSONB NOT NULL
);

-- Function to create manual backup snapshot
CREATE OR REPLACE FUNCTION create_backup_snapshot(snapshot_name TEXT)
RETURNS UUID AS $$
DECLARE
  snapshot_id UUID;
  offer_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO offer_count FROM public.offers WHERE deleted_at IS NULL;
  
  INSERT INTO public.offers_backup_snapshots (snapshot_name, offer_count, data)
  VALUES (
    snapshot_name,
    offer_count,
    (SELECT jsonb_agg(row_to_json(offers)) FROM (SELECT * FROM public.offers WHERE deleted_at IS NULL) offers)
  )
  RETURNING id INTO snapshot_id;
  
  RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_backup_snapshot IS 
  'Create a manual backup snapshot of all active offers - use before risky operations';

-- Example usage:
-- To create a backup: SELECT create_backup_snapshot('before_cleanup_2025_10_30');
-- To view backups: SELECT * FROM offers_backup_snapshots ORDER BY snapshot_date DESC;
-- To restore from backup: Use the JSON data to restore offers

