# ISMS Platform - Complete Deployment Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Deployment Steps](#detailed-deployment-steps)
5. [Configuration](#configuration)
6. [Default Accounts](#default-accounts)
7. [Using the System](#using-the-system)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)

---

## 🎯 Overview

The ISMS (Information Security Management System) Platform is a comprehensive web-based application designed to help organizations manage their compliance efforts for frameworks like SOC 2 and ISO 27001. The system includes:

- **Role-Based Access Control** (Admin, Compliance Officer, External Auditor, Employee)
- **Compliance Framework Management** (SOC 2, ISO 27001, etc.)
- **Control Tracking** with evidence management
- **Policy Management** with employee acknowledgments
- **Risk Register** with assessment and tracking
- **Dashboard & Reporting** for audit readiness

**Tech Stack:**
- Backend: FastAPI (Python)
- Frontend: React (JavaScript)
- Database: PostgreSQL
- Deployment: Docker & Docker Compose

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Docker Desktop** (or Docker Engine + Docker Compose)
   - Download from: https://www.docker.com/products/docker-desktop/
   - Minimum version: Docker 20.10+ and Docker Compose 2.0+
   
   **Verify installation:**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Git** (to clone the repository)
   - Download from: https://git-scm.com/downloads
   
   **Verify installation:**
   ```bash
   git --version
   ```

### System Requirements

- **RAM:** Minimum 4GB, Recommended 8GB
- **Disk Space:** At least 5GB free space
- **OS:** Windows 10/11, macOS, or Linux
- **Network:** Internet connection for initial setup

---

## 🚀 Quick Start

If you're familiar with Docker, here's the fastest way to get started:

```bash
# 1. Navigate to the project directory
cd /path/to/isms-platform

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Wait 30-60 seconds for initialization, then access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Default login:** admin@isms.local / admin123

---

## 📖 Detailed Deployment Steps

### Step 1: Prepare Your Environment

1. **Open a Terminal/Command Prompt**
   - Windows: Press `Win + R`, type `cmd`, press Enter
   - macOS: Press `Cmd + Space`, type `terminal`, press Enter
   - Linux: Press `Ctrl + Alt + T`

2. **Navigate to the Project Directory**
   ```bash
   cd /workspace
   ```
   
   Replace `/workspace` with the actual path where you have the ISMS project.

### Step 2: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file** (optional but recommended for production):
   
   **Windows:**
   ```bash
   notepad .env
   ```
   
   **macOS/Linux:**
   ```bash
   nano .env
   ```
   
   **Important settings to change:**
   ```env
   # Database Configuration
   DB_USER=isms_user
   DB_PASSWORD=CHANGE_THIS_PASSWORD
   DB_NAME=isms_db

   # Security - CRITICAL: Change this in production!
   SECRET_KEY=GENERATE_A_RANDOM_SECRET_KEY_HERE

   # Default Admin Account
   ADMIN_EMAIL=your-email@company.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ```

   💡 **Tip:** To generate a secure secret key, you can use:
   ```bash
   # On macOS/Linux
   openssl rand -hex 32
   
   # On Windows (PowerShell)
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   ```

3. **Save and close the file**
   - Notepad: File → Save, then close
   - Nano: Press `Ctrl + X`, then `Y`, then `Enter`

### Step 3: Build and Start the Application

1. **Build the Docker containers:**
   ```bash
   docker-compose build
   ```
   
   This will take 5-10 minutes the first time. You'll see output like:
   ```
   Building backend...
   Building frontend...
   Successfully built...
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```
   
   The `-d` flag runs containers in the background (detached mode).

3. **Check that containers are running:**
   ```bash
   docker-compose ps
   ```
   
   You should see three containers running:
   - `isms_db` (PostgreSQL)
   - `isms_backend` (FastAPI)
   - `isms_frontend` (React/Nginx)

### Step 4: Wait for Initialization

The first time you start the system, it needs to:
1. Create database tables
2. Seed initial data (frameworks, controls, policies)
3. Create default user accounts

**Wait 30-60 seconds** before accessing the application.

You can monitor the progress:
```bash
docker-compose logs -f backend
```

Press `Ctrl + C` to stop viewing logs.

### Step 5: Access the Application

Open your web browser and navigate to:

**🌐 Application URL:** http://localhost:3000

You should see the ISMS Platform login page.

---

## 🔐 Default Accounts

The system comes pre-configured with demo accounts for each role:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Administrator** | admin@isms.local | admin123 | Full system access |
| **Compliance Officer** | compliance@isms.local | compliance123 | Compliance management |
| **External Auditor** | auditor@external.com | auditor123 | Read-only access |
| **Employee** | employee@isms.local | employee123 | Policy acknowledgment |

⚠️ **IMPORTANT:** Change these passwords immediately after first login, especially if deploying to production!

---

## 💻 Using the System

### For Administrators

1. **Log in** with admin credentials
2. **Dashboard** shows overall compliance status
3. **Navigate to different modules:**
   - **Users:** Manage user accounts and roles
   - **Frameworks:** View SOC 2, ISO 27001 frameworks
   - **Controls:** Manage security controls and upload evidence
   - **Policies:** Create/edit policies and track acknowledgments
   - **Risks:** Maintain risk register
   - **Reports:** Generate compliance and risk reports

### For Employees

1. **Log in** with employee credentials
2. **Dashboard** shows pending policy acknowledgments
3. **My Policies** page lists policies requiring acknowledgment
4. **Click "Review & Acknowledge"** on any policy
5. **Read the policy** and click "I Acknowledge"

### Key Features

#### 📊 Dashboard
- Real-time compliance progress by framework
- Risk distribution charts
- Active alerts and notifications
- Quick statistics on controls and policies

#### 🛡️ Control Management
- Track implementation status
- Upload evidence files
- Map controls to framework requirements
- Assign control owners

#### 📄 Policy Management
- Create policy documents
- Version control
- Publish to employees
- Track acknowledgment rates
- Generate acknowledgment reports

#### ⚠️ Risk Management
- Document risks with likelihood and impact
- Automatic risk scoring
- Link to mitigating controls
- Track risk status over time

---

## 🔧 Troubleshooting

### Issue: Cannot access http://localhost:3000

**Solution 1: Check if containers are running**
```bash
docker-compose ps
```

If containers are not running:
```bash
docker-compose up -d
```

**Solution 2: Check for port conflicts**
```bash
# Check what's using port 3000
# On macOS/Linux:
lsof -i :3000

# On Windows:
netstat -ano | findstr :3000
```

If another application is using the port, stop it or change the port in `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "3001:80"  # Change 3000 to 3001
```

### Issue: "Connection refused" or blank page

**Solution: Wait for backend to initialize**
```bash
docker-compose logs backend
```

Look for:
```
INFO: Application startup complete.
```

This may take 30-60 seconds on first startup.

### Issue: Database connection errors

**Solution: Restart database container**
```bash
docker-compose restart db
docker-compose restart backend
```

### Issue: Login fails with correct credentials

**Solution: Check backend logs**
```bash
docker-compose logs backend | grep ERROR
```

Ensure the database is properly seeded:
```bash
docker-compose exec backend python seed_data.py
```

### Issue: Changes not appearing after rebuild

**Solution: Clean rebuild**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

⚠️ **Warning:** `-v` flag removes volumes (deletes database data)

---

## 🔐 Advanced Configuration

### Accessing the Database Directly

```bash
docker-compose exec db psql -U isms_user -d isms_db
```

Useful commands:
```sql
-- List all tables
\dt

-- Count users
SELECT COUNT(*) FROM users;

-- View policies
SELECT id, title, is_published FROM policies;

-- Exit
\q
```

### Viewing Real-time Logs

**All services:**
```bash
docker-compose logs -f
```

**Specific service:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Backing Up Data

**Backup database:**
```bash
docker-compose exec db pg_dump -U isms_user isms_db > backup.sql
```

**Restore database:**
```bash
docker-compose exec -T db psql -U isms_user isms_db < backup.sql
```

### Running on a Different Port

Edit `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Access on http://localhost:8080
  
  backend:
    ports:
      - "8001:8000"  # Backend on http://localhost:8001
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### Production Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate new `SECRET_KEY` in `.env`
- [ ] Update `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- [ ] Change database passwords
- [ ] Update CORS settings in `backend/main.py`
- [ ] Configure HTTPS/SSL (use reverse proxy like Nginx)
- [ ] Set up regular database backups
- [ ] Configure firewall rules
- [ ] Review user permissions
- [ ] Set up monitoring and logging
- [ ] Disable debug mode
- [ ] Configure email notifications (optional)

---

## 📚 Additional Resources

### API Documentation

Once the backend is running, interactive API documentation is available at:

**Swagger UI:** http://localhost:8000/docs
**ReDoc:** http://localhost:8000/redoc

### Project Structure

```
/workspace/
├── backend/              # FastAPI application
│   ├── main.py          # Main API endpoints
│   ├── models.py        # Database models
│   ├── auth.py          # Authentication logic
│   ├── schemas.py       # Pydantic schemas
│   ├── seed_data.py     # Initial data seeding
│   └── requirements.txt # Python dependencies
├── frontend/            # React application
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   └── api.js      # API client
│   └── package.json    # JavaScript dependencies
├── docker-compose.yml   # Docker orchestration
├── .env.example        # Environment template
└── DEPLOYMENT_GUIDE.md # This file
```

### Stopping the Application

```bash
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop, remove containers, and delete data
docker-compose down -v
```

### Starting Again

```bash
docker-compose up -d
```

---

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. **Check container logs:**
   ```bash
   docker-compose logs
   ```

2. **Verify environment variables:**
   ```bash
   cat .env
   ```

3. **Check Docker resources:**
   - Ensure Docker Desktop has enough memory (Settings → Resources → Memory: at least 4GB)

4. **Restart from scratch:**
   ```bash
   docker-compose down -v
   rm -rf postgres_data
   docker-compose up -d
   ```

---

## ✅ Quick Reference Commands

| Action | Command |
|--------|---------|
| Start system | `docker-compose up -d` |
| Stop system | `docker-compose stop` |
| View logs | `docker-compose logs -f` |
| Restart | `docker-compose restart` |
| Check status | `docker-compose ps` |
| Access database | `docker-compose exec db psql -U isms_user isms_db` |
| Rebuild | `docker-compose build` |
| Clean restart | `docker-compose down -v && docker-compose up -d` |

---

## 🎉 Success!

If you can log in at http://localhost:3000, congratulations! Your ISMS Platform is up and running.

**Next steps:**
1. Change default passwords
2. Explore the dashboard
3. Create your first custom policy
4. Add real users for your organization
5. Configure frameworks relevant to your compliance needs

Happy compliance management! 🚀🔒
