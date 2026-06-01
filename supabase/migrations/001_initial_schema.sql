-- ============================================================================
-- MLA.com Civic Platform - Complete Supabase Schema
-- ============================================================================
-- UUID extension and pgcrypto for password hashing and tokens
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. ORGANIZATIONS & MULTI-TENANCY
-- ============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  website TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- ============================================================================
-- 2. ROLES & PERMISSIONS
-- ============================================================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_roles_organization ON roles(organization_id);
CREATE INDEX idx_roles_is_active ON roles(is_active);

-- ============================================================================
-- 3. PROFILES & USER MANAGEMENT
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  user_type TEXT NOT NULL DEFAULT 'citizen', -- citizen, mla_office, staff, reviewer
  status TEXT DEFAULT 'active', -- active, inactive, suspended
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_token_expires_at TIMESTAMPTZ,
  password_reset_token TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  is_primary BOOLEAN DEFAULT false,
  UNIQUE(user_id, role_id, organization_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_organization_id ON user_roles(organization_id);

-- ============================================================================
-- 4. CONSTITUENCIES & MLA OFFICES
-- ============================================================================

CREATE TABLE constituencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  region TEXT,
  mla_name TEXT,
  population INTEGER,
  area_sq_km DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_constituencies_organization_id ON constituencies(organization_id);

CREATE TABLE mla_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  constituency_id UUID NOT NULL REFERENCES constituencies(id) ON DELETE CASCADE,
  mla_user_id UUID REFERENCES auth.users(id),
  office_name TEXT NOT NULL,
  office_address TEXT,
  office_phone TEXT,
  office_email TEXT,
  office_hours TEXT,
  website TEXT,
  response_sla_hours INTEGER DEFAULT 48,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, constituency_id)
);

CREATE INDEX idx_mla_offices_organization_id ON mla_offices(organization_id);
CREATE INDEX idx_mla_offices_mla_user_id ON mla_offices(mla_user_id);

-- ============================================================================
-- 5. SUBMISSIONS - CORE MODULE
-- ============================================================================

CREATE TABLE submission_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_submission_categories_organization_id ON submission_categories(organization_id);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES submission_categories(id) ON DELETE CASCADE,
  mla_office_id UUID REFERENCES mla_offices(id) ON DELETE SET NULL,
  constituency_id UUID NOT NULL REFERENCES constituencies(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  current_status TEXT DEFAULT 'drafted', -- drafted, submitted, acknowledged, under_review, forwarded, awaiting_response, scheduled, resolved, rejected, closed
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  is_public BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  assigned_reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_department TEXT,
  target_completion_date TIMESTAMPTZ,
  expected_sla_resolution_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_summary TEXT,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_submissions_organization_id ON submissions(organization_id);
CREATE INDEX idx_submissions_citizen_id ON submissions(citizen_id);
CREATE INDEX idx_submissions_mla_office_id ON submissions(mla_office_id);
CREATE INDEX idx_submissions_current_status ON submissions(current_status);
CREATE INDEX idx_submissions_assigned_reviewer_id ON submissions(assigned_reviewer_id);
CREATE INDEX idx_submissions_submission_number ON submissions(submission_number);
CREATE INDEX idx_submissions_category_id ON submissions(category_id);

-- Full-text search on submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX idx_submissions_search ON submissions USING GIN(search_vector);

CREATE TABLE submission_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_submission_status_history_submission_id ON submission_status_history(submission_id);

-- ============================================================================
-- 6. COMMENTS & DISCUSSIONS
-- ============================================================================

CREATE TABLE submission_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- only visible to office staff
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_submission_comments_submission_id ON submission_comments(submission_id);
CREATE INDEX idx_submission_comments_author_id ON submission_comments(author_id);

-- ============================================================================
-- 7. ATTACHMENTS & DOCUMENTS
-- ============================================================================

CREATE TABLE submission_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'submission-attachments',
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_submission_attachments_submission_id ON submission_attachments(submission_id);
CREATE INDEX idx_submission_attachments_file_path ON submission_attachments(file_path);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'documents',
  version INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_owner_id ON documents(owner_id);

-- ============================================================================
-- 8. NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- submission_submitted, submission_acknowledged, status_updated, comment_added, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- 9. ACTIVITIES & AUDIT LOGS
-- ============================================================================

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- created, updated, deleted, viewed, downloaded, etc.
  resource_type TEXT NOT NULL, -- submission, comment, document, etc.
  resource_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activities_organization_id ON activities(organization_id);
CREATE INDEX idx_activities_actor_id ON activities(actor_id);
CREATE INDEX idx_activities_resource_type ON activities(resource_type);
CREATE INDEX idx_activities_created_at ON activities(created_at);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success', -- success, failed, pending
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- 10. WORKFLOWS & ASSIGNMENTS
-- ============================================================================

CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  required_role TEXT,
  description TEXT,
  sla_hours INTEGER,
  auto_approve_after_sla BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workflow_steps_organization_id ON workflow_steps(organization_id);

CREATE TABLE workflow_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  workflow_step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  assigned_to_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, skipped
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workflow_assignments_submission_id ON workflow_assignments(submission_id);
CREATE INDEX idx_workflow_assignments_assigned_to_id ON workflow_assignments(assigned_to_id);

-- ============================================================================
-- 11. SETTINGS & CONFIGURATION
-- ============================================================================

CREATE TABLE office_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  mla_office_id UUID REFERENCES mla_offices(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, mla_office_id, setting_key)
);

CREATE INDEX idx_office_settings_organization_id ON office_settings(organization_id);

-- ============================================================================
-- 12. SUPPORT & FAQ
-- ============================================================================

CREATE TABLE support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
  assigned_staff_id UUID REFERENCES auth.users(id),
  response_text TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_support_requests_organization_id ON support_requests(organization_id);
CREATE INDEX idx_support_requests_citizen_id ON support_requests(citizen_id);

CREATE TABLE faq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_faq_entries_organization_id ON faq_entries(organization_id);

-- ============================================================================
-- 13. ANNOUNCEMENTS & PUBLIC CONTENT
-- ============================================================================

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_announcements_organization_id ON announcements(organization_id);
CREATE INDEX idx_announcements_is_published ON announcements(is_published);

-- ============================================================================
-- 14. CONTACT MESSAGES
-- ============================================================================

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_responded BOOLEAN DEFAULT false,
  response_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contact_messages_organization_id ON contact_messages(organization_id);
CREATE INDEX idx_contact_messages_is_read ON contact_messages(is_read);

-- ============================================================================
-- 15. SUBSCRIPTIONS & PLANS
-- ============================================================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10, 2),
  price_yearly DECIMAL(10, 2),
  max_submissions_per_month INTEGER,
  max_users INTEGER,
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active', -- active, trial, suspended, canceled
  billing_email TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger updated_at for all tables that need it
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER submission_attachments_updated_at BEFORE UPDATE ON submission_attachments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function: Generate unique submission number
CREATE OR REPLACE FUNCTION generate_submission_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  current_count INTEGER;
  new_number TEXT;
BEGIN
  current_year := TO_CHAR(now(), 'YYYY');
  SELECT COUNT(*) + 1 INTO current_count FROM submissions WHERE TO_CHAR(created_at, 'YYYY') = current_year;
  new_number := 'SUB-' || current_year || '-' || LPAD(current_count::TEXT, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function: Update submission search vector
CREATE OR REPLACE FUNCTION update_submission_search()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submission_search_update BEFORE INSERT OR UPDATE ON submissions FOR EACH ROW EXECUTE PROCEDURE update_submission_search();

-- Function: Create status history record
CREATE OR REPLACE FUNCTION handle_submission_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_status != OLD.current_status THEN
    INSERT INTO submission_status_history (submission_id, from_status, to_status, created_by)
    VALUES (NEW.id, OLD.current_status, NEW.current_status, COALESCE(NEW.updated_by, NEW.created_by));
    
    -- Create notification for status change
    INSERT INTO notifications (organization_id, recipient_id, notification_type, title, message, related_submission_id, created_at)
    VALUES (
      NEW.organization_id,
      NEW.citizen_id,
      'submission_status_updated',
      'Submission Status Updated',
      'Your submission ' || NEW.submission_number || ' status has been updated to ' || NEW.current_status,
      NEW.id,
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submission_status_change AFTER UPDATE ON submissions FOR EACH ROW EXECUTE PROCEDURE handle_submission_status_change();

-- Function: Log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
BEGIN
  user_id := COALESCE(NEW.updated_by, NEW.created_by, current_user_id());
  
  INSERT INTO audit_logs (organization_id, user_id, action, resource, resource_id, new_data, created_at)
  VALUES (
    NEW.organization_id,
    user_id,
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    row_to_json(NEW),
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_submissions AFTER INSERT OR UPDATE ON submissions FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

-- Enable RLS on all user-facing tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_assignments ENABLE ROW LEVEL SECURITY;

-- Done
