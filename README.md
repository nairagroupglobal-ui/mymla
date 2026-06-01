# MLA.com - Civic Submission Platform

A modern, production-ready platform for citizens to file petitions, applications, and grievances directly with their elected MLA representatives.

## Features

- ✅ **Civic Submissions**: File petitions, applications, grievances, and proposals
- ✅ **Real-time Tracking**: Monitor submission status in real-time with live updates
- ✅ **Secure Authentication**: Email/password, Google OAuth, OTP support
- ✅ **Multi-role System**: 6 roles with granular RBAC (citizen, staff, reviewer, admin, auditor, guest)
- ✅ **Document Management**: Upload, verify, and manage submission documents
- ✅ **Notifications**: Real-time in-app notifications and status updates
- ✅ **Audit Logging**: Comprehensive audit trails for all operations
- ✅ **Analytics Dashboard**: Insights into submissions, response times, and KPIs
- ✅ **Multi-tenant**: Support for 140+ MLAs with data isolation

## Tech Stack

### Frontend
- **React 18.2** - UI framework with strict TypeScript
- **Vite 5.0** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first styling
- **ShadCN/UI** - Accessible component library
- **TanStack Query 5.36** - Server state management
- **React Router** - Client-side routing
- **React Hook Form** - Performant forms
- **Zod** - Schema validation

### Backend
- **Supabase** - PostgreSQL database
- **PostgreSQL 15** - Relational database
- **Row Level Security** - Fine-grained access control
- **Supabase Auth** - Authentication & authorization
- **Supabase Realtime** - Live subscriptions
- **Supabase Storage** - File management

### DevOps
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Frontend deployment
- **TypeScript** - Strict type safety

## Project Structure

```
mla.com/
├── src/
│   ├── api/                    # API client layer
│   ├── components/             # Reusable components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and helpers
│   ├── pages/                  # Page components
│   ├── styles/                 # CSS files
│   ├── types/                  # TypeScript definitions
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  # Database schema
│       └── 002_rls_policies.sql    # Security policies
├── .github/workflows/          # CI/CD workflows
├── public/                     # Static assets
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
├── tailwind.config.ts          # Tailwind config
└── vercel.json                 # Vercel config
```

## Database Schema

The platform uses 15 normalized tables:

### Core Tables
- `organizations` - MLA offices and admin organizations
- `profiles` - User profiles with metadata
- `user_roles` - Role assignments per organization
- `roles` - 6 predefined roles (super_admin, mla_admin, office_staff, reviewer, citizen, guest)

### Geographic
- `constituencies` - Electoral constituencies
- `mla_offices` - MLA office details

### Submissions Workflow
- `submissions` - Civic submissions (petitions, applications, grievances, proposals)
- `submission_categories` - Submission types
- `submission_status_history` - Status change audit trail
- `submission_comments` - Internal and public comments
- `submission_attachments` - Uploaded documents

### Support & Analytics
- `notifications` - Real-time notifications
- `activities` - User activity log
- `audit_logs` - Comprehensive audit trail
- `workflow_steps` - Custom workflow templates
- `workflow_assignments` - Workflow step assignments

## Local Development

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git
- Supabase account (for database)

### Setup

1. **Clone repository**
```bash
git clone https://github.com/yourusername/mla.com.git
cd mla.com
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_API_URL=http://localhost:5173
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

4. **Setup Supabase**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase migration up
```

5. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## API Endpoints

All API operations go through the typed client in `src/api/client.ts`:

### Organizations
- `POST /organizations` - Create organization
- `GET /organizations/:id` - Get organization
- `GET /organizations` - List organizations
- `PATCH /organizations/:id` - Update organization

### Submissions
- `POST /submissions` - Create submission
- `GET /submissions/:id` - Get submission
- `GET /submissions` - List submissions
- `PATCH /submissions/:id` - Update submission
- `POST /submissions/:id/status` - Update status

### Comments
- `POST /submissions/:id/comments` - Add comment
- `GET /submissions/:id/comments` - List comments
- `DELETE /comments/:id` - Delete comment

### Notifications
- `GET /notifications` - List user notifications
- `PATCH /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

### Files
- `POST /files/upload` - Upload file
- `DELETE /files/:id` - Delete file
- `GET /files/:id/url` - Get signed URL

## Database Policies (RLS)

Row Level Security enforces access control:

**Organizations**: Users can only access their organization data
**Submissions**: Citizens see only their own, reviewers see assigned, staff/admins see all
**Comments**: Visibility based on submission access
**Audit Logs**: Only super_admin and auditors can view

## Authentication Flows

### Email/Password Sign Up
```typescript
const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: { user_type: 'citizen' }
  }
});
```

### Google OAuth
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});
```

### Password Reset
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email);
```

## Real-time Subscriptions

The app uses Supabase Realtime for live updates:

```typescript
// Subscribe to submission changes
const channel = supabase
  .channel(`submissions:${submissionId}`)
  .on('postgres_changes', { event: '*', table: 'submissions' }, payload => {
    console.log('Submission updated:', payload);
  })
  .subscribe();
```

## Building for Production

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## Deployment

### Vercel Deployment

1. **Connect GitHub repository**
   - Go to vercel.com and connect your repo

2. **Configure environment variables**
   - Add secrets in Vercel dashboard

3. **Deploy**
   - Merging to `main` branch triggers automatic deployment

### Manual Deployment to Vercel
```bash
npm install -g vercel
vercel --prod
```

## GitHub Actions CI/CD

The repository includes automated:
- ✅ Dependency installation
- ✅ TypeScript linting and type checking
- ✅ Build verification
- ✅ Automated deployment to Vercel

### Secrets Required
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## Key Hooks

Custom React hooks simplify data management:

```typescript
// Authentication
const { user, session, signUp, signIn, signOut } = useAuth();

// Submissions
const submissions = useCitizenSubmissions(userId);
const { mutate: createSubmission } = useCreateSubmission();

// Notifications
const { notifications } = useNotifications(userId);

// Real-time updates
useRealtimeSubmissions(submissionId);
```

## Testing

Run tests:
```bash
npm run test
```

## Code Quality

- **TypeScript Strict Mode** - Catches potential issues at compile time
- **ESLint** - Code linting (configured in .eslintrc)
- **Tailwind CSS** - Consistent styling
- **Type-safe API** - Zod validation on all inputs

## Security Best Practices

✅ **Row Level Security** - Database-level access control
✅ **HTTPS Only** - All communications encrypted
✅ **CORS Protection** - Restricted cross-origin requests
✅ **Input Validation** - Zod schema validation
✅ **Audit Logging** - All actions logged
✅ **Rate Limiting** - Planned for API endpoints
✅ **Secret Management** - Environment variables for sensitive data

## Support

For issues or questions:
1. Check FAQ at `/faq`
2. Contact support at `/contact`
3. Create issue on GitHub

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Roadmap

- [ ] Edge Functions for server-side operations
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Video submission support
- [ ] AI-powered categorization
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1)

## Team

- **Architecture** - Multi-tenant SaaS design
- **Database** - PostgreSQL with RLS
- **Frontend** - React + TypeScript
- **DevOps** - GitHub Actions + Vercel

---

**Last Updated**: 2024
**Version**: 1.0.0
