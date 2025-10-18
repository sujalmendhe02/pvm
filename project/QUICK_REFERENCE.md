# PrintVend Quick Reference Card

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit: http://localhost:5173

---

## 🔑 Test Machine Keys

- `ABCD1234` - Nagpur Railway Station
- `EFGH5678` - Nagpur Airport
- `IJKL9012` - Sitabuldi Market

---

## 📡 API Endpoints

```
POST /functions/v1/connect-machine
POST /functions/v1/create-job
GET  /functions/v1/machine-status?machineKey=ABCD1234
```

---

## 🗄️ Database Tables

- `machines` - Vending machine info
- `users` - User sessions
- `print_jobs` - Print queue
- `sessions` - Active connections

---

## 💻 Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview build
npm run lint       # Lint code
```

---

## 🎨 Components

- `ConnectMachine.jsx` - Machine connection
- `UploadPDF.jsx` - PDF upload & config
- `JobStatus.jsx` - Real-time tracking

---

## 📂 Important Files

```
src/
├── components/       # React components
├── lib/             # Supabase client
└── App.jsx          # Main app

supabase/functions/  # Edge functions

*.md                 # Documentation
```

---

## 🔧 Environment Variables

```env
VITE_SUPABASE_URL=https://vdcjaupmngqhbnqgvypk.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 💰 Pricing Formula

```javascript
cost = pages × rate × priority_multiplier

priority_multiplier:
  Normal = 1.0
  Urgent = 1.5
```

---

## 📄 Page Selection Format

```
1-5        → pages 1,2,3,4,5
1,3,5      → pages 1,3,5
1-3,5,7-9  → pages 1,2,3,5,7,8,9
```

---

## 🔴 Job Statuses

- `queued` - Waiting in queue
- `printing` - Currently printing
- `completed` - Finished
- `failed` - Error occurred
- `cancelled` - User cancelled

---

## 💳 Payment Statuses

- `pending` - Awaiting payment
- `paid` - Payment successful
- `failed` - Payment failed

---

## 🎯 Priority Levels

- `1` - Urgent (1.5x cost)
- `2` - Normal (1.0x cost)

---

## 🔐 Security Features

✅ Row Level Security (RLS)
✅ HTTPS enforced
✅ Input validation
✅ No data persistence (files deleted)
✅ Payment gateway integration

---

## 📱 Real-time Updates

```javascript
supabase
  .channel('jobs')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'print_jobs',
    filter: `id=eq.${jobId}`
  }, handleUpdate)
  .subscribe();
```

---

## 🛠️ Troubleshooting

**Build fails?**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**Database issues?**
- Check Supabase dashboard
- Verify RLS policies
- Check table structure

**API not responding?**
- Check edge function logs
- Verify CORS headers
- Test with curl

---

## 📚 Documentation Files

1. **README.md** - Project overview
2. **OVERVIEW.md** - Complete system guide
3. **API_DOCUMENTATION.md** - API reference
4. **DEPLOYMENT.md** - Deploy instructions
5. **USER_GUIDE.md** - End-user manual
6. **QUICK_REFERENCE.md** - This file

---

## 🌐 Useful Links

- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Tailwind: https://tailwindcss.com
- Vite: https://vitejs.dev

---

## 📊 Project Stats

- **Components**: 3 main components
- **Edge Functions**: 3 functions
- **Database Tables**: 4 tables
- **Bundle Size**: 290KB (86KB gzipped)
- **Build Time**: ~4 seconds

---

## ✅ Pre-Flight Checklist

Before deploying:

- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Build successful (`npm run build`)
- [ ] Test with sample machine key
- [ ] Test PDF upload
- [ ] Test payment flow
- [ ] Test real-time updates

---

## 🎉 Common Tasks

**Add a new machine:**
```sql
INSERT INTO machines (machine_key, name, location, status, rate_per_page)
VALUES ('WXYZ9999', 'Test Machine', 'Test Location', 'online', 2.0);
```

**Check queue for machine:**
```sql
SELECT * FROM print_jobs
WHERE machine_id = 'uuid'
  AND status IN ('queued', 'printing')
ORDER BY priority ASC, created_at ASC;
```

**Update machine status:**
```sql
UPDATE machines
SET status = 'offline'
WHERE machine_key = 'ABCD1234';
```

---

## 🐛 Debug Mode

Enable detailed logging:

```javascript
// In browser console
localStorage.setItem('debug', 'true');

// Check Supabase logs
console.log(supabase);
```

---

## 📞 Support Contacts

- Technical Issues: Check GitHub Issues
- Deployment Help: See DEPLOYMENT.md
- User Questions: See USER_GUIDE.md
- API Questions: See API_DOCUMENTATION.md

---

**Keep this card handy for quick reference! 📌**
