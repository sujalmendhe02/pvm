# Getting Started with PrintVend

Welcome! This guide will help you get PrintVend up and running in minutes.

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ Node.js 18+ installed ([Download here](https://nodejs.org/))
- ✅ A code editor (VS Code recommended)
- ✅ A web browser (Chrome, Firefox, Safari, or Edge)
- ✅ Internet connection

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages (React, Supabase, Tailwind CSS, etc.)

### Step 2: Start Development Server

```bash
npm run dev
```

The app will open at: **http://localhost:5173**

### Step 3: Test the Application

1. **Open the app** in your browser
2. **Enter test data:**
   - Name: Your Name
   - Machine Key: `ABCD1234`
3. **Click "Connect to Machine"**

That's it! You're now running PrintVend locally! 🎉

---

## 🧪 Testing Locally

### Test Machine Keys

Use these pre-configured machines for testing:

| Machine Key | Location | Rate | Status |
|-------------|----------|------|--------|
| `ABCD1234` | Nagpur Railway Station | ₹2.00/page | Online |
| `EFGH5678` | Nagpur Airport | ₹2.50/page | Online |
| `IJKL9012` | Sitabuldi Market | ₹2.00/page | Offline |

### Test PDF Files

You'll need a PDF file for testing. You can:
1. Use any PDF file from your computer
2. Download a sample PDF online
3. Create a simple PDF using Google Docs

---

## 📁 Project Structure

```
printvend/
├── src/
│   ├── components/          # React components
│   │   ├── ConnectMachine.jsx
│   │   ├── UploadPDF.jsx
│   │   └── JobStatus.jsx
│   ├── lib/
│   │   └── supabase.js      # Database connection
│   ├── App.jsx              # Main app
│   └── main.jsx             # Entry point
│
├── supabase/
│   └── functions/           # Backend API
│       ├── connect-machine/
│       ├── create-job/
│       └── machine-status/
│
├── public/                  # Static files
├── dist/                    # Build output
└── *.md                     # Documentation
```

---

## 🔧 Available Commands

```bash
# Development
npm run dev          # Start dev server (localhost:5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Check for code issues
```

---

## 🌐 Environment Variables

The app is pre-configured with Supabase connection details in `.env`:

```env
VITE_SUPABASE_URL=https://vdcjaupmngqhbnqgvypk.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

**These are already set up!** No configuration needed for local development.

---

## 📖 Understanding the Flow

### 1. Connection Phase
```
User enters name + machine key → App connects to machine
```

### 2. Upload Phase
```
User uploads PDF → Selects pages → Chooses priority
```

### 3. Payment Phase
```
User reviews cost → Makes payment → Job added to queue
```

### 4. Status Phase
```
User tracks job → Gets real-time updates → Collects print
```

---

## 🎨 User Interface Guide

### Connect Screen
- **Purpose:** Connect to a vending machine
- **Inputs:** Name, Machine Key
- **Action:** Click "Connect to Machine"

### Upload Screen
- **Purpose:** Upload PDF and configure print job
- **Actions:**
  - Upload PDF file
  - Select pages (e.g., "1-3,5")
  - Choose priority (Normal/Urgent)
  - Review cost

### Status Screen
- **Purpose:** Track print job status
- **Features:**
  - Real-time status updates
  - Queue position
  - Payment option
  - Completion notification

---

## 🔍 Troubleshooting

### Port Already in Use

**Problem:** Port 5173 is already in use

**Solution:**
```bash
# Kill the process using port 5173
# On Mac/Linux:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port:
npm run dev -- --port 3000
```

### Build Fails

**Problem:** Build command fails

**Solution:**
```bash
# Clean install
rm -rf node_modules dist
npm install
npm run build
```

### White Screen

**Problem:** App shows a white screen

**Solution:**
1. Check browser console for errors (F12)
2. Verify `.env` file exists
3. Make sure you ran `npm install`
4. Try clearing browser cache

---

## 📚 Next Steps

Once you have the app running locally:

1. **Read the Documentation**
   - `README.md` - Project overview
   - `USER_GUIDE.md` - How to use the app
   - `API_DOCUMENTATION.md` - API details

2. **Explore the Code**
   - Start with `src/App.jsx`
   - Look at components in `src/components/`
   - Check edge functions in `supabase/functions/`

3. **Test Features**
   - Try connecting to different machines
   - Upload different PDF files
   - Test page selection formats
   - Try both Normal and Urgent priority

4. **Deploy to Production**
   - Follow `DEPLOYMENT.md` for deployment steps
   - Deploy edge functions to Supabase
   - Deploy frontend to Vercel/Netlify

---

## 🎓 Learning Resources

### For Beginners

**New to React?**
- [React Official Tutorial](https://react.dev/learn)
- [React Hooks Explained](https://react.dev/reference/react)

**New to Supabase?**
- [Supabase Tutorial](https://supabase.com/docs/guides/getting-started)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

**New to Tailwind CSS?**
- [Tailwind Basics](https://tailwindcss.com/docs)
- [Tailwind Playground](https://play.tailwindcss.com/)

### For Advanced Users

- **System Architecture:** See `OVERVIEW.md`
- **API Reference:** See `API_DOCUMENTATION.md`
- **Architecture Diagrams:** See `ARCHITECTURE_DIAGRAM.txt`

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found"
**Solution:** Run `npm install` again

### Issue: "Cannot connect to database"
**Solution:** Check internet connection and `.env` file

### Issue: "PDF page count is wrong"
**Solution:** This is a known limitation for complex PDFs. Manually adjust the page selection.

### Issue: "Payment not working"
**Solution:** The payment is currently a mock implementation. For real payments, integrate Razorpay (see `DEPLOYMENT.md`).

---

## 💡 Tips for Development

### Hot Reload
- Save any file and the browser automatically refreshes
- No need to restart the server

### Browser DevTools
- Press F12 to open developer tools
- Check Console for errors
- Use Network tab to see API calls

### Component Changes
- Edit components in `src/components/`
- Changes reflect immediately
- Check browser console for errors

### Styling
- Tailwind classes update live
- Use Tailwind IntelliSense for autocomplete
- Preview classes at [tailwindcss.com](https://tailwindcss.com)

---

## 🎯 Development Workflow

### Daily Development

```bash
# 1. Start dev server
npm run dev

# 2. Make changes to code
# 3. Test in browser
# 4. Check for errors

# 5. Before committing
npm run build        # Ensure it builds
npm run lint         # Check code quality
```

### Adding Features

1. Create/modify components in `src/components/`
2. Add edge functions in `supabase/functions/`
3. Update database schema if needed
4. Test locally
5. Build and deploy

---

## 🚀 Ready to Deploy?

When you're ready to deploy to production:

1. **Review the checklist** in `DEPLOYMENT.md`
2. **Deploy edge functions** to Supabase
3. **Deploy frontend** to Vercel/Netlify
4. **Test production** deployment
5. **Monitor** using Supabase dashboard

---

## 📞 Getting Help

### Documentation
- 📖 Check all `.md` files in project root
- 🎨 Review `ARCHITECTURE_DIAGRAM.txt`
- 📚 Read `OVERVIEW.md` for system details

### Self-Help
- Browser console errors (F12)
- Supabase dashboard logs
- Network tab for API issues

### Community
- React documentation
- Supabase community
- Stack Overflow

---

## ✅ Checklist: First Time Setup

Complete these steps in order:

- [ ] Node.js 18+ installed
- [ ] Project downloaded/cloned
- [ ] Ran `npm install`
- [ ] Verified `.env` file exists
- [ ] Ran `npm run dev`
- [ ] App opens in browser
- [ ] Connected with test machine key
- [ ] Uploaded a test PDF
- [ ] Verified everything works

If you completed all steps, you're ready to go! 🎉

---

## 🎉 Success!

You now have PrintVend running locally!

**What's Next?**
1. Explore the features
2. Read the documentation
3. Modify the code
4. Deploy to production

**Happy Coding! 💻✨**

---

## 🔗 Quick Links

- [README.md](./README.md) - Project overview
- [OVERVIEW.md](./OVERVIEW.md) - System architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production
- [USER_GUIDE.md](./USER_GUIDE.md) - End-user guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference

---

**Need help? Check the documentation files or review the code comments!**
