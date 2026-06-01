# MLA.com API Documentation

Complete reference for API endpoints and data structures used in MLA.com.

## Base Configuration

All API calls go through the Supabase client configured in `src/lib/supabase-client.ts`.

```typescript
import { supabase } from '@/lib/supabase-client';
```

## Client Library

The API client (`src/api/client.ts`) provides type-safe methods for all operations.

### Import
```typescript
import { 
  organizationsAPI,
  profilesAPI,
  submissionsAPI,
  // ... other endpoints
} from '@/api/client';
```

### Response Format

All API methods return `{ data, error }` pattern:

```typescript
const { data, error } = await submissionsAPI.getById(submissionId);
if (error) {
  console.error('Failed:', error);
} else {
  console.log('Success:', data);
}
```

## Endpoints Reference

### Organizations

#### Create Organization
```typescript
organizationsAPI.create({
  name: 'MLA Office - District 5',
  email: 'contact@mlaoffice.gov',
  phone: '+91-...',
  // optional
  address: 'Street address',
  website: 'https://...',
  description: 'Organization description'
});
```

**Response**: `Organization`

#### Get Organization
```typescript
organizationsAPI.getById(organizationId);
```

**Response**: `Organization | null`

#### List Organizations
```typescript
organizationsAPI.list({
  limit: 10,
  offset: 0,
  search: 'District 5'
});
```

**Response**: `PaginatedResponse<Organization>`

#### Update Organization
```typescript
organizationsAPI.update(organizationId, {
  name: 'Updated name',
  phone: '+91-...'
});
```

**Response**: `Organization`

### Profiles

#### Get Profile
```typescript
profilesAPI.getById(userId);
```

**Response**: `Profile | null`

#### Update Profile
```typescript
profilesAPI.update(userId, {
  first_name: 'John',
  last_name: 'Doe',
  phone: '+91-...',
  avatar_url: 'https://...'
});
```

**Response**: `Profile`

#### Get Organization Profiles
```typescript
profilesAPI.getByOrganization(organizationId, {
  limit: 50,
  offset: 0
});
```

**Response**: `PaginatedResponse<Profile>`

### Submissions

#### Create Submission
```typescript
submissionsAPI.create({
  organization_id: 'org-123',
  citizen_id: 'user-456',
  category_id: 'cat-789',
  title: 'Request for...',
  description: 'Detailed description',
  status: 'drafted',
  // optional
  priority: 'normal',
  attachments: []
});
```

**Response**: `Submission` (with auto-generated submission_number)

#### Get Submission
```typescript
submissionsAPI.getById(submissionId);
```

**Response**: `Submission | null`

#### List by Citizen
```typescript
submissionsAPI.listByCitizen(citizenId, {
  status: 'submitted',
  category_id: 'cat-123',
  limit: 20,
  offset: 0
});
```

**Response**: `PaginatedResponse<Submission>`

#### List for Review
```typescript
submissionsAPI.listForReview(reviewerId, {
  status: 'under_review',
  limit: 20,
  offset: 0
});
```

**Response**: `PaginatedResponse<Submission>`

#### Search Submissions
```typescript
submissionsAPI.search({
  q: 'search term',
  organization_id: 'org-123',
  limit: 20,
  offset: 0
});
```

**Response**: `PaginatedResponse<Submission>`

#### Update Submission
```typescript
submissionsAPI.update(submissionId, {
  title: 'Updated title',
  description: 'Updated description',
  priority: 'high'
});
```

**Response**: `Submission`

#### Update Submission Status
```typescript
submissionsAPI.updateStatus(submissionId, 'acknowledged', {
  notes: 'Submission acknowledged',
  assignedTo: 'user-123'
});
```

**Response**: `Submission`

**Status Transitions**:
```
drafted
  ↓
submitted
  ↓
acknowledged
  ↓
under_review
  ├→ forwarded
  │    ↓
  │    awaiting_response
  │    ↓
  │    resolved
  ├→ rejected
  └→ scheduled
```

### Comments

#### Create Comment
```typescript
commentsAPI.create({
  submission_id: 'sub-123',
  author_id: 'user-456',
  content: 'Comment text',
  is_internal: false, // true for staff-only comments
  // optional
  parent_comment_id: 'comment-789' // for replies
});
```

**Response**: `SubmissionComment`

#### List Comments
```typescript
commentsAPI.listBySubmission(submissionId, {
  limit: 50,
  offset: 0,
  include_internal: true // only for authorized users
});
```

**Response**: `PaginatedResponse<SubmissionComment>`

#### Delete Comment
```typescript
commentsAPI.delete(commentId);
```

**Response**: `{ success: boolean }`

### Attachments

#### Create Attachment
```typescript
attachmentsAPI.create({
  submission_id: 'sub-123',
  file_name: 'document.pdf',
  file_size: 1024000,
  mime_type: 'application/pdf',
  storage_path: 'submissions/sub-123/document.pdf'
});
```

**Response**: `SubmissionAttachment`

#### List Attachments
```typescript
attachmentsAPI.listBySubmission(submissionId);
```

**Response**: `SubmissionAttachment[]`

#### Delete Attachment
```typescript
attachmentsAPI.delete(attachmentId);
```

**Response**: `{ success: boolean }`

#### Verify Attachment
```typescript
attachmentsAPI.verify(attachmentId);
```

**Response**: `{ verified: boolean, hash: string }`

### Notifications

#### List Notifications
```typescript
notificationsAPI.listByUser(userId, {
  limit: 50,
  offset: 0,
  unread_only: false
});
```

**Response**: `PaginatedResponse<Notification>`

#### Mark as Read
```typescript
notificationsAPI.markAsRead(notificationId);
```

**Response**: `Notification`

#### Mark All as Read
```typescript
notificationsAPI.markAllAsRead(userId);
```

**Response**: `{ updated: number }`

#### Get Unread Count
```typescript
notificationsAPI.getUnreadCount(userId);
```

**Response**: `{ count: number }`

#### Delete Notification
```typescript
notificationsAPI.delete(notificationId);
```

**Response**: `{ success: boolean }`

### Audit Logs

#### List Audit Logs
```typescript
auditLogsAPI.listByOrganization(organizationId, {
  action: 'submission.created',
  limit: 100,
  offset: 0,
  date_from: '2024-01-01',
  date_to: '2024-12-31'
});
```

**Response**: `PaginatedResponse<AuditLog>`

#### List User Audit Logs
```typescript
auditLogsAPI.listByUser(userId, {
  limit: 50,
  offset: 0
});
```

**Response**: `PaginatedResponse<AuditLog>`

### Storage

#### Upload File
```typescript
storageAPI.uploadFile({
  bucket: 'submissions',
  path: `${submissionId}/${file.name}`,
  file: file,
  metadata: {
    submission_id: submissionId,
    uploaded_by: userId
  }
});
```

**Response**: `{ path: string, id: string }`

#### Get Signed URL
```typescript
storageAPI.getSignedUrl({
  bucket: 'submissions',
  path: 'path/to/file',
  expiresIn: 3600 // seconds
});
```

**Response**: `{ signedUrl: string }`

#### Get Public URL
```typescript
storageAPI.getPublicUrl({
  bucket: 'submissions',
  path: 'path/to/file'
});
```

**Response**: `{ publicUrl: string }`

#### Delete File
```typescript
storageAPI.deleteFile({
  bucket: 'submissions',
  path: 'path/to/file'
});
```

**Response**: `{ success: boolean }`

## Data Types

### Organization
```typescript
interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

### Profile
```typescript
interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  user_type: UserType; // 'citizen' | 'mla_office' | 'staff' | 'reviewer'
  organization_id: string;
  created_at: string;
  updated_at: string;
}
```

### Submission
```typescript
interface Submission {
  id: string;
  organization_id: string;
  citizen_id: string;
  category_id: string;
  submission_number: string; // auto-generated
  title: string;
  description: string;
  status: SubmissionStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
}
```

## Hooks

Custom React hooks simplify common operations:

```typescript
// Authentication
const { user, session, signUp, signIn, signOut } = useAuth();

// Submission queries and mutations
const { data: submission } = useSubmission(submissionId);
const { data: submissions } = useCitizenSubmissions(userId);
const { data: assignedSubmissions } = useReviewSubmissions(reviewerId);
const { mutate: createSubmission } = useCreateSubmission();
const { mutate: updateSubmission } = useUpdateSubmission();

// Notifications with real-time updates
const { notifications, isLoading } = useNotifications(userId);

// Real-time subscription
useRealtimeSubmissions(submissionId);

// Profile
const { data: profile } = useProfile(userId);
const { mutate: updateProfile } = useUpdateProfile();
```

## Error Handling

All API calls may return errors. Handle gracefully:

```typescript
const { data, error } = await submissionsAPI.getById(id);

if (error) {
  if (error.status === 401) {
    // Handle authentication error
    redirect('/auth/login');
  } else if (error.status === 403) {
    // Handle permission error
    showToast('You do not have access to this submission');
  } else if (error.status === 404) {
    // Handle not found
    showToast('Submission not found');
  } else {
    // Handle other errors
    showToast('An error occurred: ' + error.message);
  }
} else {
  // Use data
  console.log('Submission:', data);
}
```

## Rate Limiting

API calls are rate-limited. Implement backoff:

```typescript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      } else {
        throw error;
      }
    }
  }
}
```

## Pagination

Use pagination for large datasets:

```typescript
const { data, pagination } = await submissionsAPI.list({
  limit: 20,
  offset: 0
});

// Next page
const nextPage = await submissionsAPI.list({
  limit: 20,
  offset: pagination.offset + pagination.limit
});
```

## Real-time Subscriptions

Subscribe to real-time updates:

```typescript
// Subscribe to specific submission changes
const channel = supabase
  .channel(`submissions:${submissionId}`)
  .on('postgres_changes', 
    { event: '*', table: 'submissions', filter: `id=eq.${submissionId}` },
    (payload) => console.log('Update:', payload)
  )
  .subscribe();

// Don't forget to unsubscribe
return () => supabase.removeChannel(channel);
```

## Examples

### Create and Submit a Petition

```typescript
// 1. Create submission
const { data: submission } = await submissionsAPI.create({
  organization_id: org.id,
  citizen_id: user.id,
  category_id: 'petition',
  title: 'Petition for better roads',
  description: 'Detailed petition...',
  status: 'drafted'
});

// 2. Upload attachments
const { signedUrl } = await storageAPI.getSignedUrl({
  bucket: 'submissions',
  path: `${submission.id}/petition.pdf`,
  expiresIn: 3600
});

// ... upload file to signedUrl

// 3. Update status to submitted
const { data: updated } = await submissionsAPI.updateStatus(
  submission.id,
  'submitted'
);

showToast('Petition submitted successfully');
```

### Subscribe to Notifications

```typescript
function NotificationCenter() {
  const { notifications } = useNotifications(user?.id);
  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <button>
      <Bell />
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
    </button>
  );
}
```

---

**Last Updated**: 2024
