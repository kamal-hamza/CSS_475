# 🚀 Quick Restart Guide - Query Pages Now Fixed!

## What Was Fixed

Two issues were causing 404 errors:

1. **Double `/api/` prefix**: Requests were going to `/api/api/queries/...` instead of `/api/queries/...`
2. **Port mismatch**: Frontend expected port 5001, but backend defaulted to 5002

## ✅ How to Restart Everything

### Step 1: Pull Latest Code
```bash
cd CSS_475
git checkout feat/newapis
git pull origin feat/newapis
```

### Step 2: Stop Everything
```bash
# If backend is running, press Ctrl+C to stop it
# If frontend is running, press Ctrl+C to stop it
```

### Step 3: Restart Backend (Port 5001)
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python app.py
```

**Expected output:**
```
Database tables checked.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5001
```

✅ Verify it says **port 5001** (not 5002)

### Step 4: Restart Frontend
```bash
# In a new terminal
cd frontend
npm run dev
```

**Expected output:**
```
➜  Local:   http://localhost:5173/
```

### Step 5: Test the Queries Page

1. Open browser: **http://localhost:5173**
2. Click **"Complex Queries"** in nav bar
3. You should see:
   - ✅ Page loads (no blank screen)
   - ✅ "All Teams" query auto-runs
   - ✅ Results show ~32 NFL teams
   - ✅ **NO 404 errors** in console

### Step 6: Test Any Query
1. Click on any query accordion
2. Click **"Run Query"**
3. Results should appear immediately
4. Check browser console (F12) - **NO errors**

## 🎯 Quick Test

Run this in your terminal while backend is running:

```bash
curl http://localhost:5001/api/queries/all-teams
```

**Expected:** JSON array with 32 teams  
**NOT expected:** 404 error

## What Changed

### Backend (app.py)
```python
# Before:
app.run(debug=False, host='0.0.0.0', port=5002)

# After:
app.run(debug=False, host='0.0.0.0', port=5001)
```

### Frontend (api.js)
```javascript
// Before:
const API_URL = "http://localhost:5002/api";
const response = await api.get("/teams");  // → /api/api/teams

// After:
const API_URL = "http://localhost:5001";
const response = await api.get("/api/teams");  // → /api/teams ✓
```

## ✅ Success Checklist

- [ ] Backend starts on port **5001** (not 5002)
- [ ] Frontend starts on port **5173**
- [ ] Can open http://localhost:5173
- [ ] "Complex Queries" link works
- [ ] Page loads without blank screen
- [ ] "All Teams" query auto-runs
- [ ] Can manually run other queries
- [ ] **NO** 404 errors in backend logs
- [ ] **NO** errors in browser console

## 🐛 Still Getting 404 Errors?

### Check Backend Port
```bash
# Look for this line when backend starts:
# * Running on http://127.0.0.1:5001
#                                ^^^^
#                         Must be 5001!
```

If it says 5002, check `backend/app.py` line 38.

### Check Browser Console
Press F12 → Console tab

**Before fix (broken):**
```
GET http://localhost:5001/api/api/queries/all-teams 404
                              ^^^^^^^^
                              Double /api/!
```

**After fix (working):**
```
GET http://localhost:5001/api/queries/all-teams 200
                              ^^^^
                              Single /api/ ✓
```

### Clear Browser Cache
Sometimes needed after code changes:
- Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
- Or: F12 → Application → Clear storage → Clear site data

## 🎉 You're All Set!

If all checks pass, your query pages should work perfectly now!

---

**Fixed in commit:** `8721f57`  
**Branch:** `feat/newapis`  
**Date:** December 9, 2024
