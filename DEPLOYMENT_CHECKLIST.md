# ISMS Platform - Deployment Validation Checklist

## ✅ Pre-Deployment Verification

Use this checklist to verify your ISMS Platform is ready to deploy.

---

## 📁 File Structure Check

Verify all required files exist:

### Root Directory
- [ ] `README.md` - Project overview
- [ ] `QUICKSTART.md` - Quick start guide
- [ ] `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- [ ] `FEATURES_AND_USAGE.md` - Feature documentation
- [ ] `PROJECT_SUMMARY.md` - Project summary
- [ ] `docker-compose.yml` - Docker orchestration
- [ ] `.env.example` - Environment template
- [ ] `.env` - Your environment configuration

### Backend Directory (`/backend`)
- [ ] `main.py` - Main API application
- [ ] `models.py` - Database models
- [ ] `schemas.py` - API schemas
- [ ] `auth.py` - Authentication logic
- [ ] `database.py` - Database connection
- [ ] `seed_data.py` - Data seeding script
- [ ] `requirements.txt` - Python dependencies
- [ ] `Dockerfile` - Backend container config
- [ ] `alembic.ini` - Database migration config
- [ ] `alembic/env.py` - Alembic environment
- [ ] `alembic/versions/001_initial.py` - Initial migration

### Frontend Directory (`/frontend`)
- [ ] `package.json` - JavaScript dependencies
- [ ] `vite.config.js` - Build configuration
- [ ] `Dockerfile` - Frontend container config
- [ ] `nginx.conf` - Web server config
- [ ] `index.html` - HTML entry point
- [ ] `src/main.jsx` - App entry point
- [ ] `src/App.jsx` - Main app component
- [ ] `src/api.js` - API client
- [ ] `src/index.css` - Global styles
- [ ] `src/components/Layout.jsx` - Layout component
- [ ] `src/pages/Login.jsx` - Login page
- [ ] `src/pages/Dashboard.jsx` - Dashboard
- [ ] `src/pages/Users.jsx` - User management
- [ ] `src/pages/Frameworks.jsx` - Framework management
- [ ] `src/pages/Controls.jsx` - Control management
- [ ] `src/pages/Policies.jsx` - Policy management
- [ ] `src/pages/PolicyView.jsx` - Employee policy view
- [ ] `src/pages/Risks.jsx` - Risk management
- [ ] `src/pages/Reports.jsx` - Report generation

---

## 🔧 Configuration Check

### Environment Variables (`.env`)
- [ ] File exists (copied from `.env.example`)
- [ ] `DB_USER` is set
- [ ] `DB_PASSWORD` is set (not default in production)
- [ ] `DB_NAME` is set
- [ ] `SECRET_KEY` is set (changed from default)
- [ ] `ADMIN_EMAIL` is set to your email
- [ ] `ADMIN_PASSWORD` is set (will be changed after first login)

### Docker Configuration
- [ ] Docker Desktop is installed
- [ ] Docker Desktop is running
- [ ] Docker version is 20.10+ (`docker --version`)
- [ ] Docker Compose version is 2.0+ (`docker-compose --version`)

---

## 🚀 Deployment Steps

### Step 1: Initial Setup
- [ ] Navigated to project directory: `cd /workspace`
- [ ] Environment file configured: `cp .env.example .env` (and edited)

### Step 2: Build
- [ ] Built containers: `docker-compose build`
- [ ] Build completed without errors
- [ ] All three services built (db, backend, frontend)

### Step 3: Start Services
- [ ] Started services: `docker-compose up -d`
- [ ] All containers running: `docker-compose ps` shows 3 running
- [ ] Waited 60 seconds for initialization

### Step 4: Verify Deployment
- [ ] Backend API accessible: http://localhost:8000
- [ ] Backend health check: http://localhost:8000/api/auth/me (shows 401 - good!)
- [ ] API docs accessible: http://localhost:8000/docs
- [ ] Frontend accessible: http://localhost:3000
- [ ] Login page loads without errors

---

## 🧪 Functional Testing

### Test 1: Admin Login
- [ ] Navigate to http://localhost:3000
- [ ] Login with: `admin@isms.local` / `admin123`
- [ ] Dashboard loads successfully
- [ ] See compliance progress charts
- [ ] No console errors in browser (F12)

### Test 2: Navigation
- [ ] Sidebar navigation visible
- [ ] Click "Users" - Users page loads
- [ ] Click "Frameworks" - Frameworks page loads (see SOC 2, ISO 27001)
- [ ] Click "Controls" - Controls page loads (see 10 controls)
- [ ] Click "Policies" - Policies page loads (see 5 policies)
- [ ] Click "Risks" - Risks page loads
- [ ] Click "Reports" - Reports page loads

### Test 3: User Management (Admin)
- [ ] Navigate to Users page
- [ ] Click "Add User"
- [ ] Create a test user successfully
- [ ] See new user in list

### Test 4: Control Management
- [ ] Navigate to Controls page
- [ ] Click "View" on a control's evidence
- [ ] Evidence modal opens
- [ ] Can upload evidence (test with a text file)
- [ ] Evidence appears in list

### Test 5: Policy Management
- [ ] Navigate to Policies page
- [ ] Click "Report" on "Information Security Policy"
- [ ] Report modal shows acknowledgment statistics
- [ ] Click "Edit" on a policy
- [ ] Can view/edit policy content

### Test 6: Employee Login
- [ ] Log out from admin account
- [ ] Login with: `employee@isms.local` / `employee123`
- [ ] See employee dashboard
- [ ] See pending policy count
- [ ] Navigate to "My Policies"
- [ ] See list of policies to acknowledge
- [ ] Click "Review & Acknowledge" on a policy
- [ ] Read policy and acknowledge
- [ ] Policy removed from pending list

### Test 7: Compliance Officer Login
- [ ] Log out
- [ ] Login with: `compliance@isms.local` / `compliance123`
- [ ] See full dashboard (not admin, but can manage compliance)
- [ ] Can access Controls, Policies, Risks
- [ ] Cannot access Users page

### Test 8: External Auditor Login
- [ ] Log out
- [ ] Login with: `auditor@external.com` / `auditor123`
- [ ] See dashboard (read-only view)
- [ ] Can view Controls, Policies, Risks
- [ ] No edit/delete buttons visible
- [ ] Can generate reports

### Test 9: Reports
- [ ] Login as Admin or Compliance Officer
- [ ] Navigate to Reports
- [ ] Select "SOC 2 Type 2" from dropdown
- [ ] Compliance report loads with all requirements
- [ ] Click "Download" button
- [ ] File downloads successfully
- [ ] Risk Register Report section visible
- [ ] Can download Risk Register Report

### Test 10: Risk Management
- [ ] Navigate to Risks page
- [ ] Click "Add Risk"
- [ ] Create new risk:
  - Title: "Test Risk"
  - Likelihood: 3
  - Impact: 4
  - Status: Identified
- [ ] Risk created with calculated score (12)
- [ ] Risk level shows as "High"
- [ ] Risk appears in list

---

## 🔍 System Health Check

### Container Status
```bash
docker-compose ps
```
Expected output:
```
NAME            STATUS
isms_db         Up (healthy)
isms_backend    Up
isms_frontend   Up
```

### Backend Logs
```bash
docker-compose logs backend | tail -20
```
Expected: No ERROR messages, should see "Application startup complete"

### Database Connection
```bash
docker-compose exec db psql -U isms_user isms_db -c "SELECT COUNT(*) FROM users;"
```
Expected: Returns count (should be at least 4 for demo users)

### Storage Volumes
```bash
docker volume ls | grep isms
```
Expected: See `postgres_data` and `evidence_files` volumes

---

## 🔒 Security Verification

### Post-Deployment Security
- [ ] Changed admin password immediately after first login
- [ ] Changed all demo user passwords
- [ ] Updated `SECRET_KEY` in `.env` (not using default)
- [ ] Updated database passwords in `.env`
- [ ] Reviewed and restricted CORS settings in `backend/main.py` (for production)
- [ ] Confirmed HTTPS/SSL configured (if production)
- [ ] Firewall rules configured (if production)

### Access Control Testing
- [ ] Admin can access all pages ✓
- [ ] Compliance Officer cannot access Users page ✓
- [ ] External Auditor cannot edit anything ✓
- [ ] Employee can only see policies ✓
- [ ] API returns 403 for unauthorized actions ✓

---

## 📊 Data Verification

### Pre-loaded Data Check
Run these SQL queries to verify seed data:

```bash
# Connect to database
docker-compose exec db psql -U isms_user isms_db
```

Then run:
```sql
-- Check frameworks
SELECT id, name, version FROM frameworks;
-- Expected: 2 rows (SOC 2, ISO 27001)

-- Check requirements
SELECT COUNT(*) FROM requirements;
-- Expected: 20 (10 per framework)

-- Check controls
SELECT COUNT(*) FROM controls;
-- Expected: 10

-- Check policies
SELECT id, title, is_published FROM policies;
-- Expected: 5 rows (all draft)

-- Check users
SELECT id, email, role FROM users;
-- Expected: 4 rows (admin, compliance, auditor, employee)

-- Exit
\q
```

---

## 📈 Performance Check

### Response Times
- [ ] Login response < 2 seconds
- [ ] Dashboard load < 3 seconds
- [ ] Page navigation < 1 second
- [ ] Report generation < 5 seconds

### Browser Compatibility
- [ ] Chrome ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Edge ✓

---

## 🎯 Production Readiness (Optional)

If deploying to production:

### Infrastructure
- [ ] Reverse proxy configured (Nginx/Traefik)
- [ ] SSL certificates installed
- [ ] Domain name configured
- [ ] DNS records updated
- [ ] Firewall rules: Only 80/443 exposed

### Backup & Recovery
- [ ] Database backup script created
- [ ] Backup schedule configured (daily recommended)
- [ ] Backup restoration tested
- [ ] Evidence files backup configured
- [ ] Disaster recovery plan documented

### Monitoring
- [ ] Application logs configured
- [ ] Database monitoring setup
- [ ] Disk space monitoring
- [ ] Uptime monitoring
- [ ] Alert system configured

### Maintenance
- [ ] Update procedure documented
- [ ] Rollback procedure tested
- [ ] Maintenance window scheduled
- [ ] Team trained on system

---

## ✅ Final Verification

- [ ] All functional tests pass ✓
- [ ] All user roles work correctly ✓
- [ ] All modules accessible ✓
- [ ] No error messages in logs ✓
- [ ] Data persists after container restart ✓
- [ ] Performance acceptable ✓
- [ ] Documentation reviewed ✓
- [ ] Team trained ✓

---

## 🚀 Ready to Deploy!

If all checks pass, your ISMS Platform is ready for use!

### Next Steps:
1. **Change default passwords** for all accounts
2. **Create real user accounts** for your team
3. **Customize policies** for your organization
4. **Upload evidence** for implemented controls
5. **Document risks** in the risk register
6. **Publish policies** to employees
7. **Generate baseline reports** for leadership

---

## 🆘 If Something Failed

### Common Issues

**Containers won't start:**
```bash
# View detailed logs
docker-compose logs

# Restart fresh
docker-compose down -v
docker-compose up -d
```

**Database errors:**
```bash
# Restart database
docker-compose restart db
docker-compose restart backend
```

**Login fails:**
```bash
# Check if seed data loaded
docker-compose logs backend | grep "seed"

# Re-run seed script
docker-compose exec backend python seed_data.py
```

**Port conflicts:**
```bash
# Check what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change ports in docker-compose.yml if needed
```

### Get Help
- Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed troubleshooting
- Check logs: `docker-compose logs backend` or `docker-compose logs frontend`
- Verify environment: `cat .env`

---

## 📝 Deployment Notes

**Date Deployed:** _______________

**Deployed By:** _______________

**Environment:** □ Development  □ Staging  □ Production

**Server/Location:** _______________

**Issues Encountered:** 

_______________________________________________

_______________________________________________

**Resolution:**

_______________________________________________

_______________________________________________

**Sign-off:** _______________

---

**Congratulations! Your ISMS Platform is deployed and operational! 🎉🔒**
