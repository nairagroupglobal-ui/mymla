// src/types/index.ts
export type UserType = 'citizen' | 'mla_office' | 'staff' | 'reviewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type RoleName = 'super_admin' | 'mla_admin' | 'office_staff' | 'reviewer' | 'citizen' | 'guest';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  user_type: UserType;
  status: UserStatus;
  is_verified: boolean;
  last_login_at?: string;
  last_login_ip?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  organization_id: string;
  name: RoleName;
  display_name: string;
  description?: string;
  permissions: string[];
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  organization_id: string;
  assigned_at: string;
  assigned_by?: string;
  is_primary: boolean;
}

export interface Constituency {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  region?: string;
  mla_name?: string;
  population?: number;
  area_sq_km?: number;
  created_at: string;
  updated_at: string;
}

export interface MLAOffice {
  id: string;
  organization_id: string;
  constituency_id: string;
  mla_user_id?: string;
  office_name: string;
  office_address?: string;
  office_phone?: string;
  office_email?: string;
  office_hours?: string;
  website?: string;
  response_sla_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmissionCategory {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  display_order?: number;
  created_at: string;
}

export type SubmissionStatus =
  | 'drafted'
  | 'submitted'
  | 'acknowledged'
  | 'under_review'
  | 'forwarded'
  | 'awaiting_response'
  | 'scheduled'
  | 'resolved'
  | 'rejected'
  | 'closed';

export type SubmissionPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Submission {
  id: string;
  organization_id: string;
  category_id: string;
  mla_office_id?: string;
  constituency_id: string;
  citizen_id: string;
  submission_number: string;
  title: string;
  description: string;
  current_status: SubmissionStatus;
  priority: SubmissionPriority;
  is_public: boolean;
  is_anonymous: boolean;
  assigned_reviewer_id?: string;
  assigned_department?: string;
  target_completion_date?: string;
  expected_sla_resolution_date?: string;
  resolved_at?: string;
  resolution_summary?: string;
  rejection_reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface SubmissionStatusHistory {
  id: string;
  submission_id: string;
  from_status: SubmissionStatus;
  to_status: SubmissionStatus;
  reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
  created_by: string;
}

export interface SubmissionComment {
  id: string;
  submission_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionAttachment {
  id: string;
  submission_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  storage_bucket: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  organization_id: string;
  owner_id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  storage_bucket: string;
  version: number;
  is_public: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'submission_submitted'
  | 'submission_acknowledged'
  | 'submission_status_updated'
  | 'comment_added'
  | 'assignment_changed'
  | 'attachment_uploaded'
  | 'support_response';

export interface Notification {
  id: string;
  organization_id: string;
  recipient_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_submission_id?: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Activity {
  id: string;
  organization_id: string;
  actor_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failed' | 'pending';
  error_message?: string;
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  organization_id: string;
  workflow_name: string;
  step_order: number;
  step_name: string;
  required_role?: string;
  description?: string;
  sla_hours?: number;
  auto_approve_after_sla: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAssignment {
  id: string;
  submission_id: string;
  workflow_step_id: string;
  assigned_to_id: string;
  assigned_by_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportRequest {
  id: string;
  organization_id: string;
  citizen_id: string;
  subject: string;
  message: string;
  attachments_count: number;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_staff_id?: string;
  response_text?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FAQEntry {
  id: string;
  organization_id: string;
  category: string;
  question: string;
  answer: string;
  is_published: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  organization_id: string;
  title: string;
  content: string;
  image_url?: string;
  published_at?: string;
  expires_at?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ContactMessage {
  id: string;
  organization_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_responded: boolean;
  response_text?: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  max_submissions_per_month?: number;
  max_users?: number;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'trial' | 'suspended' | 'canceled';
  billing_email?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
}

// API Response types
export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
  status: number;
}

export interface APIError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ListFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  mlaOffice?: string;
  reviewer?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
