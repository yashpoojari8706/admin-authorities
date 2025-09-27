# Supabase Backend Setup for Police Dashboard

This document provides comprehensive instructions for setting up the Supabase backend for the Tourist Safety Emergency Response System (SOS) dashboard.

## Overview

The backend includes:
- **Database Schema**: Complete PostgreSQL schema with all necessary tables
- **Row Level Security (RLS)**: Secure access control policies
- **Real-time Subscriptions**: Live updates for dashboard data
- **API Functions**: Stored procedures for complex operations
- **TypeScript Integration**: Full type safety with Supabase client

## Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 16 or higher
3. **pnpm**: Package manager (or npm/yarn)

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `police-dashboard` or similar
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

## Step 2: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (keep this secret!)

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
   NEXT_PUBLIC_APP_ENV=development
   ```

## Step 4: Install Dependencies

```bash
pnpm install @supabase/supabase-js
```

## Step 5: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in your Supabase dashboard
2. Run each migration file in order:

#### 1. Initial Schema (`001_initial_schema.sql`)
Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` and click "Run"

#### 2. RLS Policies (`002_rls_policies.sql`)
Copy and paste the contents of `supabase/migrations/002_rls_policies.sql` and click "Run"

#### 3. Seed Data (`003_seed_data.sql`)
Copy and paste the contents of `supabase/migrations/003_seed_data.sql` and click "Run"

#### 4. API Functions (`api_functions.sql`)
Copy and paste the contents of `supabase/functions/api_functions.sql` and click "Run"

### Option B: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

## Step 6: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see the following tables:
   - `users`
   - `authorities`
   - `sos_reports`
   - `incident_photos`
   - `response_notes`
   - `response_timeline`

3. Check that sample data is loaded:
   - `sos_reports` should have 12 sample reports
   - `users` should have 11 sample users
   - `authorities` should have 9 sample authority units

## Step 7: Test the Integration

1. Start your Next.js development server:
   ```bash
   pnpm dev
   ```

2. The dashboard should now display real data from Supabase instead of mock data

## Database Schema Overview

### Core Tables

#### `users` - Tourist Information
- Stores tourist/user details who create SOS reports
- Fields: name, phone, email, nationality

#### `authorities` - Response Units
- Police, medical, fire, and tourist guide units
- Fields: unit_name, unit_type, contact info, location

#### `sos_reports` - Main Reports Table
- Central table for all SOS emergency reports
- Fields: location, incident details, status, priority, assignments

#### `incident_photos` - Photo Documentation
- Stores URLs/paths to incident photos
- Linked to reports via foreign key

#### `response_notes` - Progress Tracking
- Notes added by authorities during response
- Timeline of actions taken

#### `response_timeline` - Status History
- Automatic tracking of status changes
- Audit trail for all report updates

### Views and Functions

#### `dashboard_stats` - Statistics View
- Real-time dashboard statistics
- Counts by status, priority, etc.

#### `recent_reports_view` - Enhanced Report View
- Joins all related data for dashboard display
- Includes user, authority, and count information

#### API Functions
- `get_dashboard_stats()` - Dashboard statistics
- `get_recent_reports(limit)` - Recent reports with details
- `create_sos_report()` - Create new emergency report
- `update_report_status()` - Update report status
- `assign_authority_to_report()` - Assign response unit

## Real-time Features

The system includes real-time subscriptions for:
- New SOS reports
- Status updates
- Response notes
- Timeline changes

These are handled automatically by the React hooks in `lib/hooks/useRealtimeReports.ts`.

## Security Features

### Row Level Security (RLS)
- **Users**: Can only see their own data
- **Authorities**: Can see all reports and user data
- **Admins**: Full access to all data

### API Security
- All functions use `SECURITY DEFINER`
- Proper authentication checks
- Input validation and sanitization

## API Usage Examples

### Get Dashboard Stats
```typescript
import { APIService } from '@/lib/api-service'

const stats = await APIService.getDashboardStats()
console.log(stats) // { totalReports: 12, activeReports: 5, ... }
```

### Get Recent Reports
```typescript
const reports = await APIService.getRecentReports(10)
console.log(reports) // Array of SOSReport objects
```

### Create New Report
```typescript
const reportId = await APIService.createSOSReport({
  user_id: 'user-uuid',
  latitude: 19.076,
  longitude: 72.8777,
  address: 'Gateway of India, Mumbai',
  incident_type: 'medical',
  incident_description: 'Tourist needs medical assistance',
  priority: 'high'
})
```

### Update Report Status
```typescript
await APIService.updateReportStatus(
  'SOS-001',
  'in-progress',
  'authority-uuid',
  'Medical team dispatched'
)
```

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables are correct
   - Check Supabase project is active
   - Ensure network connectivity

2. **Permission Errors**
   - Check RLS policies are applied
   - Verify user authentication
   - Ensure proper role assignments

3. **Migration Errors**
   - Run migrations in correct order
   - Check for syntax errors in SQL
   - Verify extensions are enabled

### Getting Help

1. Check Supabase logs in dashboard
2. Use browser developer tools for client errors
3. Review PostgreSQL logs for database issues

## Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Use production Supabase project
- Secure service role key storage
- Enable SSL/TLS

### Performance Optimization
- Enable connection pooling
- Set up proper indexes (already included)
- Monitor query performance

### Backup Strategy
- Enable automated backups in Supabase
- Regular data exports
- Test restore procedures

## Next Steps

1. **Authentication**: Implement user authentication with Supabase Auth
2. **File Storage**: Set up Supabase Storage for incident photos
3. **Edge Functions**: Add serverless functions for complex operations
4. **Monitoring**: Set up logging and monitoring
5. **Testing**: Add comprehensive test suite

## Support

For issues specific to this implementation:
- Check the GitHub repository issues
- Review Supabase documentation
- Contact the development team

For Supabase-specific issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Supabase Discord](https://discord.supabase.com)
