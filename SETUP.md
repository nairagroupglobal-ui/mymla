# MLA.com Setup Guide

Complete step-by-step guide to set up and deploy MLA.com.

## 1. Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed ([nodejs.org](https://nodejs.org))
- npm or pnpm package manager
- Git installed
- GitHub account (for repository)
- Supabase account ([supabase.com](https://supabase.com))
- Vercel account for deployment ([vercel.com](https://vercel.com))

### Verify Installation
```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be v9.0.0 or higher
git --version     # Should show git version
```

## 2. Supabase Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in details:
   - **Name**: mla-com-prod (or similar)
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier okay for development

4. Wait for project to initialize (2-3 minutes)

### Configure Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy content from `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Repeat for `supabase/migrations/002_rls_policies.sql`

### Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - `URL` (VITE_SUPABASE_URL)
   - `anon public` key (VITE_SUPABASE_ANON_KEY)
   - `service_role` key (VITE_SUPABASE_SERVICE_ROLE_KEY)

3. Note these for environment setup

### Enable Auth Providers

1. Go to **Authentication** → **Providers**
2. Enable:
   - Email (enabled by default)
   - Google OAuth (optional):
     - Go to [Google Cloud Console](https://console.cloud.google.com)
     - Create OAuth 2.0 credentials
     - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback?provider=google`
     - Copy Client ID

## 3. Clone and Setup

### Clone Repository
```bash
git clone https://github.com/yourusername/mla.com.git
cd mla.com
```

### Install Dependencies
```bash
npm install
```

### Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VITE_API_URL=http://localhost:5173
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Important**: Never commit `.env.local` file. It's in `.gitignore` by default.

## 4. Local Development

### Start Dev Server
```bash
npm run dev
```

The app opens at `http://localhost:5173`

### Available Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
npm run test       # Run tests (if configured)
```

## 5. Test the Platform

### Create Test Account
1. Go to `http://localhost:5173/auth/signup`
2. Sign up with test email (e.g., test@example.com)
3. Check email for confirmation link
4. Verify email and complete signup

### Navigate
- Home page: `http://localhost:5173`
- Login: `http://localhost:5173/auth/login`
- Dashboard: `http://localhost:5173/dashboard` (after login)

### Test Features
- Create a submission from dashboard
- Upload documents
- Check notifications
- Update submission status (admin only)

## 6. Deploy to Vercel

### Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js (select "Other" and configure manually if needed)

### Configure Vercel

1. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Environment Variables**:
   - Click "Add" and fill in:
     ```
     VITE_SUPABASE_URL = [your-url]
     VITE_SUPABASE_ANON_KEY = [your-key]
     VITE_API_URL = [vercel-domain]
     VITE_GOOGLE_CLIENT_ID = [your-id]
     ```

3. Click "Deploy"

### Update Supabase CORS
1. In Supabase: **Settings** → **API**
2. Update CORS origin to include your Vercel domain

### Update Google OAuth
If using Google sign-in:
1. Go to Google Cloud Console
2. Update authorized redirect URIs to include Vercel deployment

## 7. GitHub Actions Setup

The repository includes automatic CI/CD. To enable:

1. Go to repository **Settings** → **Secrets and variables**
2. Add these repository secrets:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_API_URL
   VERCEL_TOKEN (from Vercel settings)
   VERCEL_ORG_ID (from Vercel settings)
   VERCEL_PROJECT_ID (from Vercel settings)
   ```

3. On next push to `main`, automatic deployment triggers

## 8. Database Backup

### Manual Backup
```bash
# Using Supabase CLI
supabase db pull  # Downloads schema
supabase db push  # Uploads schema changes
```

### Automated Backups
1. Go to Supabase: **Settings** → **Backups**
2. Enable automatic backups (recommended for production)

## 9. Monitoring & Debugging

### View Logs
```bash
# Supabase logs
# Go to Supabase dashboard → Logs

# GitHub Actions logs
# Go to repository → Actions → [workflow run] → Logs
```

### Debug Local Issues
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check build errors
npm run build

# Type check
npm run type-check
```

## 10. Production Checklist

Before going live:

- [ ] Database backups enabled
- [ ] CORS configured for all domains
- [ ] Authentication providers set up
- [ ] Environment variables configured
- [ ] SSL certificate active (automatic on Vercel)
- [ ] Rate limiting configured (planned)
- [ ] Audit logging enabled
- [ ] Error tracking configured
- [ ] Monitoring and alerts set up
- [ ] Documentation updated

## 11. Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Database Connection Issues
- Verify credentials in `.env.local`
- Check Supabase project status
- Verify IP whitelist (if configured)

### Deployment Issues
- Check GitHub Actions logs
- Review Vercel build logs
- Verify environment variables are set

### Missing Supabase Data
- Re-run migrations
- Check migration order (001 before 002)
- Verify SQL syntax

## 12. Next Steps

After setup:

1. **Customize**: Update branding, colors, content
2. **Add Users**: Create admin and staff accounts
3. **Configure Categories**: Add submission categories for your region
4. **Test Workflows**: Create test submissions end-to-end
5. **Train Users**: Set up user documentation and training
6. **Go Live**: Enable public access and notify users

## Support

For issues:
1. Check [README.md](README.md) for general info
2. Review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
3. Check [GitHub Issues](https://github.com/yourusername/mla.com/issues)
4. Contact support team

## Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

---

**Last Updated**: 2024
**Version**: 1.0.0
