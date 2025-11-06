# ISMS Platform - Information Security Management System

<div align="center">

![ISMS Platform](https://img.shields.io/badge/ISMS-Platform-4F46E5)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**A comprehensive web-based platform for managing compliance with SOC 2, ISO 27001, and other security frameworks**

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Architecture](#architecture)

</div>

---

## 🎯 Overview

The ISMS Platform is a modern, feature-rich Information Security Management System designed to streamline compliance efforts for organizations pursuing certifications like SOC 2 Type 2 and ISO 27001. Built with security best practices and user experience in mind, it provides a centralized hub for managing controls, policies, risks, and audit activities.

### Why ISMS Platform?

- **🔒 Security-First Design**: Built with modern security practices including RBAC, JWT authentication, and encrypted data storage
- **📊 Audit-Ready**: Generate comprehensive reports for auditors at any time
- **👥 Multi-Role Support**: Tailored experiences for admins, compliance officers, auditors, and employees
- **🚀 Easy Deployment**: One-command Docker deployment with no complex setup
- **📈 Real-Time Dashboards**: Track compliance progress and risk metrics at a glance
- **📝 Policy Automation**: Streamline policy acknowledgment and tracking

---

## ✨ Features

### Core Modules

#### 🛡️ **Compliance Framework Management**
- Pre-loaded SOC 2 Type 2 and ISO 27001:2013 frameworks
- Support for custom frameworks and requirements
- Framework-to-control mapping
- Real-time compliance progress tracking

#### 📋 **Control Management**
- Comprehensive control library with pre-mapped controls
- Status tracking (Not Started, In Progress, Implemented, Failed)
- Evidence management with file uploads
- Control ownership assignment
- Continuous monitoring hooks
- Last-checked timestamps

#### 📄 **Policy Management**
- Policy template library (Security, Acceptable Use, Access Control, etc.)
- Version control for policy documents
- Employee acknowledgment workflow
- Acknowledgment tracking and reporting
- Publishing workflow with approval

#### ⚠️ **Risk Management**
- Complete risk register
- Likelihood and impact assessment (1-5 scale)
- Automatic risk scoring and level calculation
- Risk-to-control mapping
- Status tracking (Identified, In Progress, Mitigated, Accepted, Closed)
- Change history audit trail

#### 📊 **Dashboard & Reporting**
- Role-specific dashboards
- Compliance progress visualization
- Risk distribution charts
- Active alerts and notifications
- Downloadable reports (Compliance, Risk Register, Policy Acknowledgment)
- Audit-ready documentation

#### 👥 **User & Access Management**
- Four distinct user roles:
  - **Administrator**: Full system access and configuration
  - **Compliance Officer**: Manage compliance data and activities
  - **External Auditor**: Read-only access to review compliance
  - **Employee**: Policy acknowledgment and training tasks
- Role-based access control (RBAC)
- User activity tracking

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- 4GB+ RAM available
- 5GB+ free disk space

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd /workspace
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env to set passwords and secret keys
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Access the platform:**
   - **Web Interface**: http://localhost:3000
   - **API Documentation**: http://localhost:8000/docs

5. **Login with default admin account:**
   - Email: `admin@isms.local`
   - Password: `admin123`

**That's it! 🎉** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📖 Documentation

- **[Complete Deployment Guide](DEPLOYMENT_GUIDE.md)** - Step-by-step setup instructions for beginners
- **[API Documentation](http://localhost:8000/docs)** - Interactive Swagger UI (when running)
- **User Roles & Permissions** - See below

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **Authentication**: JWT tokens with bcrypt password hashing
- **ORM**: SQLAlchemy 2.0
- **API Docs**: Automatic OpenAPI/Swagger generation

**Frontend:**
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Styling**: Custom CSS with design tokens

**Deployment:**
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (for frontend)
- **WSGI Server**: Uvicorn (for backend)

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    End Users                        │
│  (Admins, Compliance Officers, Auditors, Employees) │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│           Frontend (React + Nginx)                  │
│              http://localhost:3000                   │
└────────────────────┬────────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────┐
│           Backend API (FastAPI)                     │
│              http://localhost:8000                   │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │     Auth    │  │   Business   │  │  Reports  │ │
│  │   (JWT)     │  │    Logic     │  │ Generator │ │
│  └─────────────┘  └──────────────┘  └───────────┘ │
└────────────────────┬────────────────────────────────┘
                     │ SQL
                     ▼
┌─────────────────────────────────────────────────────┐
│         Database (PostgreSQL)                       │
│                                                      │
│  • Users & Roles      • Controls & Evidence        │
│  • Frameworks         • Policies & Acknowledgments │
│  • Requirements       • Risks & History            │
└─────────────────────────────────────────────────────┘
```

### Database Schema

Key tables:
- `users` - User accounts and roles
- `frameworks` - Compliance frameworks (SOC 2, ISO 27001)
- `requirements` - Framework requirements/clauses
- `controls` - Security controls
- `control_requirement` - Many-to-many mapping
- `evidence` - Control evidence files/text
- `policies` - Policy documents
- `policy_acknowledgments` - User acknowledgments
- `policy_versions` - Policy version history
- `risks` - Risk register
- `risk_history` - Risk change audit trail
- `alerts` - System alerts/notifications

---

## 👥 User Roles & Permissions

| Feature | Admin | Compliance Officer | External Auditor | Employee |
|---------|-------|-------------------|------------------|----------|
| View Dashboard | ✅ Full | ✅ Full | ✅ Limited | ✅ Personal |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Manage Frameworks | ✅ | ✅ | ❌ | ❌ |
| Manage Controls | ✅ | ✅ | 👁️ Read-only | ❌ |
| Upload Evidence | ✅ | ✅ | ❌ | ❌ |
| Manage Policies | ✅ | ✅ | 👁️ Read-only | ❌ |
| Acknowledge Policies | ✅ | ✅ | ❌ | ✅ |
| Manage Risks | ✅ | ✅ | 👁️ Read-only | ❌ |
| Generate Reports | ✅ | ✅ | ✅ | ❌ |
| System Configuration | ✅ | ❌ | ❌ | ❌ |

---

## 📦 Pre-Loaded Content

The system comes with comprehensive seed data to get you started immediately:

### Frameworks
- **SOC 2 Type 2 (2017)** - 10 Trust Services Criteria including CC6.2 (MFA), CC7.1 (Detection), CC8.1 (Change Management)
- **ISO 27001:2013** - 10 Annex A controls including A.9.4.2 (Secure Logon), A.12.4.1 (Event Logging)

### Pre-Mapped Controls
- Multi-Factor Authentication (MFA) Enforcement
- User Access Review Process
- User Offboarding Procedure
- Security Information and Event Monitoring (SIEM)
- Incident Response Plan
- Change Management Process
- Information Security Policy Suite
- Password Complexity Requirements
- Segregation of Duties
- Compliance Training Program

### Policy Templates
- Information Security Policy
- Acceptable Use Policy
- Access Control Policy
- Incident Response Policy
- Data Protection and Privacy Policy

All controls are pre-mapped to relevant framework requirements!

---

## 🔐 Security Features

- **Authentication**: JWT-based with secure token storage
- **Password Security**: Bcrypt hashing with salt
- **Role-Based Access Control**: Enforced at API level
- **SQL Injection Prevention**: Parameterized queries via SQLAlchemy ORM
- **XSS Prevention**: Input sanitization and validation
- **CORS Configuration**: Configurable for production
- **Session Management**: Token expiration and refresh
- **Audit Trail**: Change tracking for risks and policies
- **File Upload Security**: Type validation and secure storage

---

## 🛠️ Development

### Running in Development Mode

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### API Endpoints

See interactive documentation at http://localhost:8000/docs

Key endpoints:
- `POST /api/auth/login` - User authentication
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/controls` - List controls
- `POST /api/evidence` - Upload evidence
- `GET /api/reports/compliance/{framework_id}` - Generate compliance report

### Environment Variables

See `.env.example` for all available configuration options:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing key
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password

---

## 📊 Sample Screenshots

### Admin Dashboard
- Real-time compliance progress bars
- Risk distribution pie charts
- Active alerts feed
- Key metrics cards

### Control Management
- Filterable control list
- Evidence upload interface
- Status tracking
- Requirement mapping

### Policy Management
- Policy editor with markdown support
- Acknowledgment tracking
- Version history
- Publishing workflow

### Risk Register
- Likelihood/Impact matrix
- Automatic risk scoring
- Control association
- Status management

---

## 🚢 Production Deployment

For production deployment:

1. **Update environment variables:**
   - Generate strong `SECRET_KEY`
   - Change all default passwords
   - Update database credentials

2. **Configure HTTPS:**
   - Use a reverse proxy (Nginx, Traefik)
   - Obtain SSL certificates (Let's Encrypt)

3. **Update CORS settings:**
   - Edit `backend/main.py` to restrict origins

4. **Set up backups:**
   - Regular PostgreSQL backups
   - Evidence file backups

5. **Enable monitoring:**
   - Application logs
   - Database metrics
   - Container health checks

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production checklist.

---

## 🤝 Contributing

This is a complete, production-ready ISMS platform. Future enhancements could include:

- Integration with cloud providers (AWS, Azure, GCP) for automated evidence collection
- SAML/SSO authentication
- Email notifications for policy acknowledgments
- Advanced reporting with custom filters
- Mobile app for on-the-go approvals
- Integration with ticketing systems (Jira, ServiceNow)
- Automated compliance checks via APIs

---

## 📄 License

This project is provided as-is for organizational use. Modify and deploy as needed for your compliance requirements.

---

## 🆘 Support

- **Deployment Issues**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **API Questions**: Check http://localhost:8000/docs
- **Database Access**: `docker-compose exec db psql -U isms_user isms_db`

---

## 📝 Release Notes

### Version 1.0.0

**Initial Release**
- Complete ISMS platform with 4 user roles
- SOC 2 and ISO 27001 framework support
- Pre-loaded controls and policy templates
- Evidence management with file uploads
- Risk register with automatic scoring
- Policy acknowledgment workflow
- Comprehensive reporting
- Docker-based deployment
- Interactive dashboards with charts
- Full API documentation

---

<div align="center">

**Built with ❤️ for information security professionals**

</div>
