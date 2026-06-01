-- ============================================================================
-- Row Level Security Policies for MLA.com Civic Platform
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS - Super admins only
-- ============================================================================

CREATE POLICY "organizations_select_own_or_admin"
ON organizations FOR SELECT
USING (
  -- User is member of this organization
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.organization_id = organizations.id
    AND profiles.id = auth.uid()
  )
  -- OR user is super admin
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name = 'super_admin'
    AND ur.user_id = auth.uid()
  )
);

CREATE POLICY "organizations_insert_super_admin_only"
ON organizations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name = 'super_admin'
    AND ur.user_id = auth.uid()
  )
);

-- ============================================================================
-- PROFILES - Users can see their own, admins can see organization members
-- ============================================================================

CREATE POLICY "profiles_select_own_or_admin"
ON profiles FOR SELECT
USING (
  -- Own profile
  id = auth.uid()
  -- Admin within same organization
  OR (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('super_admin', 'mla_admin')
      AND ur.user_id = auth.uid()
      AND ur.organization_id = profiles.organization_id
    )
  )
);

CREATE POLICY "profiles_update_own_or_admin"
ON profiles FOR UPDATE
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'mla_admin')
    AND ur.user_id = auth.uid()
    AND ur.organization_id = profiles.organization_id
  )
);

CREATE POLICY "profiles_insert_authenticated"
ON profiles FOR INSERT
WITH CHECK (
  id = auth.uid()
);

-- ============================================================================
-- SUBMISSIONS - Role-based access
-- ============================================================================

CREATE POLICY "submissions_select_own_or_assigned_or_admin"
ON submissions FOR SELECT
USING (
  -- Citizen viewing own submission
  citizen_id = auth.uid()
  -- Assigned reviewer
  OR assigned_reviewer_id = auth.uid()
  -- MLA office staff can view submissions for their office
  OR (
    mla_office_id IN (
      SELECT id FROM mla_offices WHERE mla_user_id = auth.uid()
    )
  )
  -- Admin or auditor can view all
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'mla_admin', 'auditor')
    AND ur.user_id = auth.uid()
    AND ur.organization_id = submissions.organization_id
  )
  -- Public submissions for authenticated users
  OR (is_public = true AND created_by IS NOT NULL)
);

CREATE POLICY "submissions_insert_citizen"
ON submissions FOR INSERT
WITH CHECK (
  citizen_id = auth.uid()
  AND created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND organization_id = submissions.organization_id
  )
);

CREATE POLICY "submissions_update_own_or_reviewer_or_admin"
ON submissions FOR UPDATE
USING (
  citizen_id = auth.uid()
  OR assigned_reviewer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'mla_admin')
    AND ur.user_id = auth.uid()
    AND ur.organization_id = submissions.organization_id
  )
);

-- ============================================================================
-- SUBMISSION COMMENTS - Role-based visibility
-- ============================================================================

CREATE POLICY "submission_comments_select"
ON submission_comments FOR SELECT
USING (
  -- Can view if can view submission
  submission_id IN (
    SELECT id FROM submissions
    WHERE citizen_id = auth.uid()
    OR assigned_reviewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM mla_offices WHERE mla_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('super_admin', 'mla_admin', 'auditor')
      AND ur.user_id = auth.uid()
    )
  )
  -- Internal comments only visible to staff/admin
  AND (
    is_internal = false
    OR author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('super_admin', 'mla_admin', 'office_staff', 'reviewer')
      AND ur.user_id = auth.uid()
    )
  )
);

CREATE POLICY "submission_comments_insert"
ON submission_comments FOR INSERT
WITH CHECK (
  author_id = auth.uid()
  AND submission_id IN (
    SELECT id FROM submissions
    WHERE citizen_id = auth.uid()
    OR assigned_reviewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('super_admin', 'mla_admin', 'office_staff', 'reviewer')
      AND ur.user_id = auth.uid()
    )
  )
);

-- ============================================================================
-- SUBMISSION ATTACHMENTS - Access control
-- ============================================================================

CREATE POLICY "submission_attachments_select"
ON submission_attachments FOR SELECT
USING (
  submission_id IN (
    SELECT id FROM submissions
    WHERE citizen_id = auth.uid()
    OR assigned_reviewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM mla_offices WHERE mla_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('super_admin', 'mla_admin', 'office_staff', 'reviewer', 'auditor')
      AND ur.user_id = auth.uid()
    )
  )
);

CREATE POLICY "submission_attachments_insert"
ON submission_attachments FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid()
  AND submission_id IN (
    SELECT id FROM submissions WHERE citizen_id = auth.uid()
  )
);

-- ============================================================================
-- NOTIFICATIONS - User receives own notifications
-- ============================================================================

CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
USING (
  recipient_id = auth.uid()
);

CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
USING (
  recipient_id = auth.uid()
);

-- ============================================================================
-- AUDIT LOGS - Admins and auditors only
-- ============================================================================

CREATE POLICY "audit_logs_select_admin"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'mla_admin', 'auditor')
    AND ur.user_id = auth.uid()
    AND ur.organization_id = audit_logs.organization_id
  )
);

-- ============================================================================
-- ACTIVITIES - Users can see activities related to their submissions/items
-- ============================================================================

CREATE POLICY "activities_select"
ON activities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM submissions
    WHERE submissions.id = activities.resource_id
    AND submissions.citizen_id = auth.uid()
    OR submissions.assigned_reviewer_id = auth.uid()
  )
  OR actor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'mla_admin', 'auditor')
    AND ur.user_id = auth.uid()
    AND ur.organization_id = activities.organization_id
  )
);

-- ============================================================================
-- WORKFLOW ASSIGNMENTS - Assigned users and admins
-- ============================================================================

CREATE POLICY "workflow_assignments_select"
ON workflow_assignments FOR SELECT
USING (
  assigned_to_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'mla_admin')
    AND ur.user_id = auth.uid()
  )
);

CREATE POLICY "workflow_assignments_update"
ON workflow_assignments FOR UPDATE
USING (
  assigned_to_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'mla_admin')
    AND ur.user_id = auth.uid()
  )
);

-- Done
