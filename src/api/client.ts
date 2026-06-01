// src/api/client.ts
import { supabase } from '@/lib/supabase-client';
import type {
  Organization,
  Profile,
  Submission,
  SubmissionComment,
  SubmissionAttachment,
  Notification,
  Activity,
  AuditLog,
  Constituency,
  MLAOffice,
  SubmissionCategory,
  PaginatedResponse,
  ListFilters,
} from '@/types';

// ============================================================================
// ORGANIZATIONS API
// ============================================================================

export const organizationsAPI = {
  async create(data: Partial<Organization>) {
    return supabase.from('organizations').insert([data]).select().single();
  },

  async getById(id: string) {
    return supabase.from('organizations').select('*').eq('id', id).single();
  },

  async list() {
    return supabase.from('organizations').select('*').order('created_at', { ascending: false });
  },

  async update(id: string, data: Partial<Organization>) {
    return supabase
      .from('organizations')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  },
};

// ============================================================================
// PROFILES API
// ============================================================================

export const profilesAPI = {
  async getById(userId: string) {
    return supabase.from('profiles').select('*').eq('id', userId).single();
  },

  async update(userId: string, data: Partial<Profile>) {
    return supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
  },

  async getByOrganization(organizationId: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', organizationId)
      .order('full_name', { ascending: true });
  },
};

// ============================================================================
// SUBMISSIONS API
// ============================================================================

export const submissionsAPI = {
  async create(data: Partial<Submission>) {
    // Generate submission number via database function
    const { data: submitData, error } = await supabase.rpc('generate_submission_number');
    if (error) throw error;

    return supabase
      .from('submissions')
      .insert([{ ...data, submission_number: submitData }])
      .select()
      .single();
  },

  async getById(id: string) {
    return supabase.from('submissions').select('*').eq('id', id).single();
  },

  async listByCitizen(citizenId: string, filters?: ListFilters) {
    let query = supabase
      .from('submissions')
      .select('*')
      .eq('citizen_id', citizenId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('current_status', filters.status);
    if (filters?.priority) query = query.eq('priority', filters.priority);
    if (filters?.category) query = query.eq('category_id', filters.category);

    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query = query.range(offset, offset + filters.limit - 1);
    }

    return query;
  },

  async listForReview(reviewerId: string, filters?: ListFilters) {
    let query = supabase
      .from('submissions')
      .select('*')
      .eq('assigned_reviewer_id', reviewerId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('current_status', filters.status);

    return query;
  },

  async search(organizationId: string, searchText: string) {
    return supabase
      .from('submissions')
      .select('*')
      .eq('organization_id', organizationId)
      .textSearch('search_vector', searchText)
      .limit(20);
  },

  async update(id: string, data: Partial<Submission>) {
    return supabase
      .from('submissions')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  },

  async updateStatus(id: string, newStatus: string, reason?: string, updatedBy?: string) {
    return supabase
      .from('submissions')
      .update({
        current_status: newStatus,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      })
      .eq('id', id)
      .select()
      .single();
  },
};

// ============================================================================
// SUBMISSION COMMENTS API
// ============================================================================

export const commentsAPI = {
  async create(data: Partial<SubmissionComment>) {
    return supabase.from('submission_comments').insert([data]).select().single();
  },

  async listBySubmission(submissionId: string) {
    return supabase
      .from('submission_comments')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });
  },

  async delete(id: string) {
    return supabase.from('submission_comments').delete().eq('id', id);
  },
};

// ============================================================================
// SUBMISSION ATTACHMENTS API
// ============================================================================

export const attachmentsAPI = {
  async create(data: Partial<SubmissionAttachment>) {
    return supabase.from('submission_attachments').insert([data]).select().single();
  },

  async listBySubmission(submissionId: string) {
    return supabase
      .from('submission_attachments')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false });
  },

  async delete(id: string) {
    return supabase.from('submission_attachments').delete().eq('id', id);
  },

  async verify(id: string, verifiedBy: string) {
    return supabase
      .from('submission_attachments')
      .update({
        is_verified: true,
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
  },
};

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsAPI = {
  async listByUser(userId: string, limit = 20) {
    return supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
  },

  async markAsRead(id: string) {
    return supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  },

  async markAllAsRead(userId: string) {
    return supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', userId)
      .eq('is_read', false);
  },

  async getUnreadCount(userId: string) {
    return supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);
  },

  async delete(id: string) {
    return supabase.from('notifications').delete().eq('id', id);
  },
};

// ============================================================================
// AUDIT LOGS API
// ============================================================================

export const auditLogsAPI = {
  async listByOrganization(organizationId: string, filters?: ListFilters) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query = query.range(offset, offset + filters.limit - 1);
    }

    return query;
  },

  async listByUser(organizationId: string, userId: string) {
    return supabase
      .from('audit_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
  },
};

// ============================================================================
// ACTIVITIES API
// ============================================================================

export const activitiesAPI = {
  async listByOrganization(organizationId: string, limit = 50) {
    return supabase
      .from('activities')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);
  },

  async listByResource(organizationId: string, resourceType: string, resourceId: string) {
    return supabase
      .from('activities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false });
  },
};

// ============================================================================
// STORAGE API
// ============================================================================

export const storageAPI = {
  async uploadFile(bucket: string, path: string, file: File) {
    return supabase.storage.from(bucket).upload(path, file, { upsert: false });
  },

  async deleteFile(bucket: string, path: string) {
    return supabase.storage.from(bucket).remove([path]);
  },

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    return supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  },

  async getPublicUrl(bucket: string, path: string) {
    return supabase.storage.from(bucket).getPublicUrl(path);
  },
};

// ============================================================================
// CONSTITUENCIES API
// ============================================================================

export const constituenciesAPI = {
  async listByOrganization(organizationId: string) {
    return supabase
      .from('constituencies')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name', { ascending: true });
  },

  async getById(id: string) {
    return supabase.from('constituencies').select('*').eq('id', id).single();
  },
};

// ============================================================================
// MLA OFFICES API
// ============================================================================

export const mlaOfficesAPI = {
  async listByOrganization(organizationId: string) {
    return supabase
      .from('mla_offices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('office_name', { ascending: true });
  },

  async getById(id: string) {
    return supabase.from('mla_offices').select('*').eq('id', id).single();
  },

  async getByConstituency(constituencyId: string) {
    return supabase.from('mla_offices').select('*').eq('constituency_id', constituencyId).single();
  },
};

// ============================================================================
// SUBMISSION CATEGORIES API
// ============================================================================

export const categoriesAPI = {
  async listByOrganization(organizationId: string) {
    return supabase
      .from('submission_categories')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
  },
};

export default {
  organizations: organizationsAPI,
  profiles: profilesAPI,
  submissions: submissionsAPI,
  comments: commentsAPI,
  attachments: attachmentsAPI,
  notifications: notificationsAPI,
  auditLogs: auditLogsAPI,
  activities: activitiesAPI,
  storage: storageAPI,
  constituencies: constituenciesAPI,
  mlaOffices: mlaOfficesAPI,
  categories: categoriesAPI,
};
