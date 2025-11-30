# VendHub Showcase - Deployment Blockers & Fix Plan

## 🚨 CRITICAL ISSUES (Prevent 24/7 Deployment)

### 1. EMFILE Error - Too Many Open Files ❌
**Status:** BLOCKING  
**Severity:** CRITICAL  
**Impact:** Server crashes immediately after startup

**Problem:**
- Error: `EMFILE: too many open files, watch '/home/ubuntu/vendhub-showcase/client'`
- File descriptor limit: 1,024 (too low)
- Open files count: 10,000+ (zombie processes)
- Vite file watcher cannot start

**Root Cause:**
- Multiple server restarts left zombie Node/tsx processes
- Each process holds hundreds of file descriptors
- System limit exhausted before Vite can start

**Fix Required:**
- [ ] Kill all zombie Node/tsx processes system-wide
- [ ] Increase file descriptor limit to 65,536
- [ ] Configure systemd service with proper limits
- [ ] Clean up /tmp and stale file handles

---

### 2. Frontend Not Rendering - Black Screen ❌
**Status:** BLOCKING  
**Severity:** CRITICAL  
**Impact:** Users see black screen, React not mounting

**Problem:**
- React root div remains empty: `<div id="root"></div>`
- No JavaScript errors in console (because JS never loads)
- Vite dev server never starts due to EMFILE error
- Browser shows "This page is currently unavailable"

**Root Cause:**
- Vite crashes during startup (EMFILE error)
- Server prints "Server running on http://localhost:3000/" but immediately dies
- No HTTP server listening on port 3000

**Fix Required:**
- [ ] Fix EMFILE error (prerequisite)
- [ ] Verify Vite starts successfully
- [ ] Test React mounting in browser
- [ ] Verify all routes load correctly

---

### 3. Database Schema Mismatch ⚠️
**Status:** PARTIALLY FIXED  
**Severity:** HIGH  
**Impact:** tRPC queries fail with "Unknown column" errors

**Problem:**
- Drizzle schema defines camelCase: `productId`, `locationId`
- Database has snake_case: `product_id`, `location_id`
- SQL queries fail: `Unknown column 'inventory.productid'`

**Current State:**
- ✅ Added explicit column name mappings in schema.ts
- ❌ Not tested due to server crash
- ❌ May have more unmapped columns

**Fix Required:**
- [ ] Verify all column mappings are correct
- [ ] Test all tRPC queries after server starts
- [ ] Add missing mappings if any queries fail

---

### 4. NotificationCenter Causing Render Failures ⚠️
**Status:** IDENTIFIED  
**Severity:** MEDIUM  
**Impact:** Unauthorized tRPC calls block page rendering

**Problem:**
- NotificationCenter makes tRPC calls on mount
- Queries require authentication (protectedProcedure)
- Returns 401 Unauthorized for non-logged-in users
- Error handler tries to redirect during render → crash

**Current State:**
- ✅ NotificationCenter temporarily commented out
- ❌ Need proper conditional rendering solution

**Fix Required:**
- [ ] Add authentication check before rendering NotificationCenter
- [ ] Make tRPC queries conditional: `enabled: !!user`
- [ ] Add proper error boundaries
- [ ] Test with and without authentication

---

## 📋 SECONDARY ISSUES (Quality & Stability)

### 5. TypeScript Compilation Errors ⚠️
**Status:** NON-BLOCKING  
**Severity:** LOW  
**Impact:** IDE warnings, potential runtime issues

**Problem:**
```
error TS6053: File 'lib.esnext.d.ts' not found
Found 13 errors. Watching for file changes.
```

**Fix Required:**
- [ ] Fix tsconfig.json library references
- [ ] Ensure all type definitions are installed
- [ ] Run `pnpm check` to verify

---

### 6. Missing Environment Variables 📝
**Status:** UNKNOWN  
**Severity:** MEDIUM  
**Impact:** Features may not work in production

**Potential Missing:**
- Database credentials (currently using Manus-provided)
- Telegram bot token (for notifications)
- Claude API key (for AI features)
- OAuth secrets (Google, Telegram)

**Fix Required:**
- [ ] Document all required environment variables
- [ ] Test with production-like configuration
- [ ] Add validation on startup

---

## 🔧 FIX EXECUTION PLAN

### Phase 1: System Cleanup (CRITICAL)
```bash
# 1. Kill all zombie processes
pkill -9 node
pkill -9 tsx

# 2. Clean temporary files
rm -rf /tmp/vite-*
rm -rf /tmp/tsx-*
rm -rf ~/.cache/vite

# 3. Increase file descriptor limit
ulimit -n 65536

# 4. Verify cleanup
lsof -u ubuntu | wc -l  # Should be < 1000
```

### Phase 2: Server Restart (CRITICAL)
```bash
# 1. Clear Vite cache
cd /home/ubuntu/vendhub-showcase
rm -rf node_modules/.vite
rm -rf client/.vite

# 2. Restart with increased limits
NODE_ENV=development pnpm exec tsx server/_core/index.ts

# 3. Verify server starts
curl http://localhost:3000  # Should return HTML
netstat -tlnp | grep 3000   # Should show LISTEN
```

### Phase 3: Frontend Verification (CRITICAL)
```bash
# 1. Test in browser
open https://3000-...manusvm.computer

# 2. Check React mounting
# Should see content, not black screen

# 3. Test routing
# Navigate to /login, /machines, etc.
```

### Phase 4: Database & tRPC Testing (HIGH)
```bash
# 1. Test database queries
pnpm test  # Run all unit tests

# 2. Test tRPC endpoints manually
curl -X POST http://localhost:3000/api/trpc/machines.list

# 3. Fix any "Unknown column" errors
```

### Phase 5: Authentication Flow (MEDIUM)
```bash
# 1. Test login page
# 2. Test OAuth flows
# 3. Test protected routes
# 4. Re-enable NotificationCenter with auth check
```

---

## ✅ SUCCESS CRITERIA

### Must Have (24/7 Deployment Ready):
- [ ] Server starts without EMFILE error
- [ ] Port 3000 listening and responding
- [ ] Frontend renders (no black screen)
- [ ] All routes accessible
- [ ] Database queries work
- [ ] No TypeScript errors
- [ ] All tests passing

### Should Have (Production Quality):
- [ ] Authentication working
- [ ] Notifications working
- [ ] AI features working
- [ ] All environment variables documented
- [ ] Performance optimized
- [ ] Error handling robust

---

## 🎯 ESTIMATED FIX TIME

- **Phase 1 (System Cleanup):** 5 minutes
- **Phase 2 (Server Restart):** 10 minutes
- **Phase 3 (Frontend Verification):** 5 minutes
- **Phase 4 (Database Testing):** 15 minutes
- **Phase 5 (Authentication):** 15 minutes

**Total:** ~50 minutes

---

## 📝 NOTES

- Current checkpoint: `633c9fe4`
- Last working state: Unknown (never fully worked)
- Database: MySQL (Manus-provided)
- Framework: React 19 + Vite 7 + tRPC + Drizzle ORM
