# Deployment Guide for PrintVend

## Deploying Edge Functions

The backend uses Supabase Edge Functions. Here's how to deploy them:

### Prerequisites

1. Supabase CLI installed (optional, can use dashboard)
2. Supabase project created (already done)
3. Database migrations applied (already done)

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to "Edge Functions" in the sidebar
4. Click "Create Function"
5. Copy the code from each function file in `supabase/functions/`

**Functions to Deploy:**

#### connect-machine
- Path: `supabase/functions/connect-machine/index.js`
- Purpose: Connects users to vending machines

#### create-job
- Path: `supabase/functions/create-job/index.js`
- Purpose: Creates print jobs in the queue

#### machine-status
- Path: `supabase/functions/machine-status/index.js`
- Purpose: Retrieves machine and queue information

### Option 2: Using MCP Supabase Tools

If you're using the Claude Code environment with Supabase MCP:

```javascript
// The functions can be deployed using the mcp__supabase__deploy_edge_function tool
// This is already set up in the development environment
```

### Testing Edge Functions

After deployment, test each function:

**Test connect-machine:**
```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/connect-machine \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{"machineKey": "ABCD1234", "userName": "Test User"}'
```

**Test machine-status:**
```bash
curl -X GET \
  'https://YOUR_PROJECT.supabase.co/functions/v1/machine-status?machineKey=ABCD1234' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

---

## Deploying Frontend

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your repository
5. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

**Build Settings:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

### Option 2: Netlify

1. Push your code to GitHub
2. Go to https://netlify.com
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Site Settings → Environment Variables
7. Click "Deploy site"

### Option 3: AWS Amplify

1. Push your code to GitHub
2. Go to AWS Amplify Console
3. Click "Host web app"
4. Connect your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
6. Add environment variables
7. Deploy

### Option 4: Static File Hosting

Build locally and upload:

```bash
npm run build
```

Upload the `dist/` folder to:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Any static hosting service

---

## Environment Variables

Make sure these are set in your deployment environment:

```env
VITE_SUPABASE_URL=https://vdcjaupmngqhbnqgvypk.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Security Note:** The anon key is safe to expose in the frontend as it's protected by Row Level Security policies.

---

## Database Configuration

The database is already configured with:

✅ Tables created (machines, users, print_jobs, sessions)
✅ RLS policies enabled
✅ Indexes added for performance
✅ Sample data inserted

No additional database setup required!

---

## Post-Deployment Checklist

### Frontend
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] App loads without errors
- [ ] Can connect to machine using test key (ABCD1234)

### Backend
- [ ] All 3 edge functions deployed
- [ ] Functions return 200 status on test requests
- [ ] CORS headers working correctly
- [ ] Database queries executing successfully

### Database
- [ ] Can view tables in Supabase dashboard
- [ ] Sample machines visible in machines table
- [ ] RLS policies active

### Testing
- [ ] Test user connection flow
- [ ] Test PDF upload (use data URL fallback if needed)
- [ ] Test job creation
- [ ] Test real-time updates
- [ ] Test payment flow (mock)

---

## Monitoring

### Supabase Dashboard

Monitor your app in the Supabase dashboard:

1. **Table Editor**: View real-time data
   - Check print_jobs table for new jobs
   - Monitor machine status
   - View user sessions

2. **Logs**: Check Edge Function logs
   - Functions → Select function → Logs tab
   - Monitor for errors or slow responses

3. **Database**: Monitor performance
   - Check query performance
   - Monitor connection pool usage

### Frontend Monitoring

Consider adding:
- Google Analytics for user tracking
- Sentry for error tracking
- LogRocket for session replay

---

## Scaling Considerations

### Current Limits (Supabase Free Tier)
- 500MB database storage
- 2GB bandwidth
- 500K Edge Function invocations
- 50K monthly active users

### When to Upgrade
- High number of concurrent print jobs
- Large PDF files (>10MB)
- Multiple machines (>10)
- Heavy traffic (>1000 daily users)

### Optimization Tips

1. **Database**:
   - Add indexes for frequently queried fields
   - Use connection pooling
   - Archive completed jobs older than 30 days

2. **Edge Functions**:
   - Cache machine data
   - Batch database operations
   - Use database functions for complex queries

3. **Frontend**:
   - Enable Vite build optimizations
   - Use lazy loading for components
   - Compress images and assets
   - Use CDN for static files

---

## Backup Strategy

### Database Backups

Supabase automatically backs up your database, but you can also:

```sql
-- Export print jobs
COPY (SELECT * FROM print_jobs) TO '/tmp/print_jobs_backup.csv' CSV HEADER;

-- Export machines
COPY (SELECT * FROM machines) TO '/tmp/machines_backup.csv' CSV HEADER;
```

### Manual Backup via Dashboard

1. Go to Database → Backups
2. Click "Create Backup"
3. Download backup file

---

## Rollback Plan

If deployment fails:

1. **Frontend**: Revert to previous deployment in Vercel/Netlify
2. **Edge Functions**: Deploy previous version via dashboard
3. **Database**: Restore from backup (if needed)

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL automatically provisioned

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS
4. HTTPS enabled automatically

---

## SSL/HTTPS

All major hosting platforms (Vercel, Netlify, AWS Amplify) provide:
- Automatic SSL certificates
- HTTPS redirect
- HTTP/2 support

No additional configuration needed!

---

## CI/CD Pipeline (Optional)

Set up automatic deployments:

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy # Configure based on your host
```

---

## Troubleshooting

### Common Issues

**1. Edge Functions not responding:**
- Check function logs in Supabase dashboard
- Verify CORS headers are set
- Ensure environment variables are available

**2. Realtime not working:**
- Check Supabase Realtime is enabled
- Verify RLS policies allow reads
- Check browser console for errors

**3. Database connection errors:**
- Check connection pool usage
- Verify RLS policies
- Check query syntax

**4. Frontend not loading:**
- Clear browser cache
- Check environment variables
- Verify build completed successfully

---

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com

---

## Production Ready Checklist

Before going live:

### Security
- [ ] Environment variables secured
- [ ] RLS policies tested
- [ ] Input validation on all forms
- [ ] HTTPS enabled
- [ ] API rate limiting considered

### Performance
- [ ] Frontend built and minified
- [ ] Images optimized
- [ ] Database queries indexed
- [ ] CDN configured (optional)

### Monitoring
- [ ] Error tracking setup
- [ ] Analytics configured
- [ ] Uptime monitoring
- [ ] Database backup scheduled

### Documentation
- [ ] README updated
- [ ] API docs complete
- [ ] Deployment guide tested
- [ ] User guide created (optional)

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor database size
- Review slow queries

**Monthly:**
- Archive old completed jobs
- Review and optimize queries
- Check for security updates

**Quarterly:**
- Update dependencies
- Review and update documentation
- Performance audit

---

## Need Help?

If you encounter issues during deployment:

1. Check the logs in Supabase Dashboard
2. Review the error messages
3. Check the troubleshooting section above
4. Review Supabase documentation
5. Check GitHub issues (if project is on GitHub)

---

**Good luck with your deployment! 🚀**
