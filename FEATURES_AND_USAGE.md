# ISMS Platform - Features & Usage Guide

## 📑 Complete Feature List

### 🔐 Authentication & Authorization

#### Multi-Role Access Control
The system implements **Role-Based Access Control (RBAC)** with four distinct user types:

1. **Administrator**
   - Full system access
   - User management (create, edit, deactivate users)
   - System configuration
   - All compliance officer capabilities

2. **Compliance Officer / Internal Auditor**
   - Manage frameworks and controls
   - Upload and manage evidence
   - Create and publish policies
   - Manage risk register
   - Generate reports
   - Cannot manage users or system settings

3. **External Auditor**
   - Read-only access to all compliance data
   - View controls, evidence, policies, and risks
   - Generate and download reports
   - Cannot modify any data
   - Special "Audit Portal" view

4. **General Employee**
   - View and acknowledge published policies
   - See personal dashboard with pending tasks
   - Cannot access compliance management features

#### Security Features
- **JWT Token Authentication**: Secure, stateless authentication
- **Password Hashing**: Bcrypt with salt for secure password storage
- **Session Management**: Configurable token expiration (default 8 hours)
- **API Authorization**: Every endpoint validates user permissions
- **Input Validation**: Server-side validation to prevent injection attacks

---

## 📊 Dashboard Module

### Admin/Compliance Dashboard
**Route:** `/` (Home)

**Features:**
- **Key Metrics Cards**:
  - Total Risks
  - High/Critical Risks count
  - Active Alerts
  - Controls Lacking Evidence

- **Compliance Progress Section**:
  - Bar chart showing progress by framework
  - Percentage completion (calculated from control statuses)
  - Real-time updates

- **Risk Distribution**:
  - Pie chart visualizing High/Medium/Low risks
  - Color-coded for quick assessment

- **Active Alerts Feed**:
  - Most recent unresolved alerts
  - Severity levels (Critical, Warning, Info)
  - Timestamps

### Employee Dashboard
**Route:** `/`

**Features:**
- Personal greeting
- Count of pending policy acknowledgments
- Company-wide compliance status (awareness)
- Quick action links to acknowledge policies

### Auditor Dashboard
**Route:** `/`

**Features:**
- Read-only view of compliance metrics
- Framework progress tracking
- Risk statistics
- No modification capabilities

---

## 🛡️ Control Management Module

**Route:** `/controls`  
**Access:** Admin, Compliance Officer, External Auditor (read-only)

### Features

#### Control List View
- **Comprehensive table** with columns:
  - Title and Description
  - Implementation Status (Not Started, In Progress, Implemented, Failed)
  - Control Owner
  - Evidence count/link
  - Last checked timestamp
  
- **Status Color Coding**:
  - 🟢 Implemented (Green)
  - 🟡 In Progress (Yellow)
  - ⚫ Not Started (Gray)
  - 🔴 Failed (Red)

#### Control Creation/Editing
- **Required Fields**:
  - Title
  - Description
  - Status
  
- **Optional Fields**:
  - Owner (assigned from user list)
  - Implementation details
  - Framework requirement mappings

- **Auto-Update**: Last checked timestamp updates on any modification

#### Evidence Management
- **View Evidence**: Click "View" button on any control
- **Upload Evidence**:
  - Text-based evidence (for policies, procedures)
  - File attachments (screenshots, documents, exports)
  - Descriptive title and notes
  - Automatic timestamp
  
- **Evidence Display**:
  - List all evidence items for a control
  - Show uploader and upload date
  - File name and type indicators
  - Delete functionality (Admin/Compliance only)

#### Pre-Loaded Controls (10)
1. Multi-Factor Authentication (MFA) Enforcement
2. User Access Review Process
3. User Offboarding Procedure
4. Security Information and Event Monitoring (SIEM)
5. Incident Response Plan
6. Change Management Process
7. Information Security Policy Suite
8. Password Complexity Requirements
9. Segregation of Duties
10. Compliance Training Program

All controls are pre-mapped to SOC 2 and/or ISO 27001 requirements!

---

## 📄 Policy Management Module

**Route:** `/policies` (Admin/Compliance/Auditor)  
**Route:** `/policies` (Employee - different view)

### For Admin/Compliance Officers

#### Policy Library
- Create new policies from scratch
- Edit existing policies
- Version control (automatic history)
- Draft and Published states

#### Policy Editor
- **Title**: Policy name
- **Version**: Manual version number (e.g., 1.0, 2.1)
- **Content**: Full policy text (markdown supported)
- Rich text area for detailed policy content

#### Publishing Workflow
1. Create/Edit policy (saved as Draft)
2. Click "Publish" button
3. Confirmation dialog (warns about employee acknowledgment requirement)
4. Policy becomes visible to all employees
5. Acknowledgment tasks created for each employee

#### Acknowledgment Tracking
- **View Report**: Click "Report" button on any policy
- **Report Shows**:
  - Total users
  - Acknowledged count
  - Pending count
  - Acknowledgment rate (percentage)
  - Progress bar visualization
  - List of pending users with contact info

#### Policy Templates (5 Pre-Loaded)
1. **Information Security Policy**
   - Comprehensive security framework
   - Classification guidelines
   - Access control principles
   - Incident reporting requirements
   
2. **Acceptable Use Policy**
   - IT resource usage guidelines
   - Account security requirements
   - Email and communication standards
   - Prohibited activities
   
3. **Access Control Policy**
   - User access request process
   - Privileged access management
   - MFA requirements
   - Password policies
   - Access review procedures
   
4. **Incident Response Policy**
   - Incident classification
   - Response procedures
   - Communication protocols
   - Post-incident review process
   
5. **Data Protection and Privacy Policy**
   - Data classification
   - Collection and use guidelines
   - Storage and security requirements
   - Data subject rights
   - Breach response

### For Employees

#### My Policies View
- **Pending Policies List**:
  - Highlighted policies requiring acknowledgment
  - Policy title, version, and publish date
  - "Review & Acknowledge" button
  
- **Acknowledgment Process**:
  1. Click "Review & Acknowledge"
  2. Read full policy in modal window
  3. Scroll to bottom
  4. Check confirmation checkbox
  5. Click "I Acknowledge" button
  6. Acknowledgment recorded with timestamp

- **Completion Status**:
  - "All Caught Up!" message when no pending policies
  - Count of pending policies in dashboard

### Version Control
- **Automatic Version History**:
  - Previous versions saved when policy updated
  - Historical content preserved
  - Version numbers tracked
  
- **Re-acknowledgment Required**:
  - When policy content changes, previous acknowledgments cleared
  - Users must acknowledge new version
  - Old acknowledgments remain in history

---

## ⚠️ Risk Management Module

**Route:** `/risks`  
**Access:** Admin, Compliance Officer, External Auditor (read-only)

### Features

#### Risk Register
- **Complete risk tracking** with sortable table
- **Columns**:
  - Title and Category
  - Likelihood (1-5)
  - Impact (1-5)
  - Risk Score (auto-calculated: Likelihood × Impact)
  - Risk Level (auto-assigned: Critical/High/Medium/Low)
  - Status
  - Owner
  
#### Risk Assessment
- **Likelihood Scale (1-5)**:
  - 1 = Rare
  - 2 = Unlikely
  - 3 = Possible
  - 4 = Likely
  - 5 = Almost Certain
  
- **Impact Scale (1-5)**:
  - 1 = Insignificant
  - 2 = Minor
  - 3 = Moderate
  - 4 = Major
  - 5 = Severe

#### Risk Scoring Algorithm
```
Risk Score = Likelihood × Impact

Risk Levels:
- Score 20-25: Critical (Red)
- Score 12-19: High (Red)
- Score 6-11: Medium (Yellow)
- Score 1-5: Low (Green)
```

#### Risk Creation/Editing
- **Required Fields**:
  - Title
  - Description
  - Likelihood (1-5)
  - Impact (1-5)
  
- **Optional Fields**:
  - Category (e.g., Operational, Financial, Compliance, Cybersecurity)
  - Owner (assigned from user list)
  - Status
  - Mitigating controls (link to existing controls)

#### Risk Statuses
- **Identified**: Newly discovered risk
- **In Progress**: Mitigation efforts underway
- **Mitigated**: Controls implemented, residual risk accepted
- **Accepted**: Risk accepted as-is (no mitigation)
- **Closed**: Risk no longer applicable

#### Change History
- **Audit Trail**: All risk modifications logged
- **History Includes**:
  - Who made the change
  - What changed
  - When it changed
  - Change description

#### Risk Statistics Dashboard
- Total Risks count
- Critical/High Risks count (with alert color)
- Medium Risks count
- Low Risks count
- Visual indicators for quick assessment

---

## 🏗️ Framework & Requirements Module

**Route:** `/frameworks`  
**Access:** Admin, Compliance Officer, External Auditor (read-only)

### Features

#### Framework Management
- **View all compliance frameworks**
- **Pre-loaded**:
  - SOC 2 Type 2 (2017) - 10 Trust Services Criteria
  - ISO 27001:2013 - 10 Annex A Controls
  
- **Add custom frameworks**:
  - Framework name
  - Version number
  - Description

#### Requirements View
- **Click "View Requirements"** on any framework
- **Shows detailed list**:
  - Requirement code (e.g., CC6.2, A.9.4.2)
  - Requirement title
  - Full description
  
#### Pre-Loaded Requirements

**SOC 2 Trust Services Criteria (10)**:
- CC1.1: Control Environment - Integrity and Ethics
- CC1.2: Board Independence and Oversight
- CC6.1: Logical Access Controls
- CC6.2: Access Authorization
- CC6.3: User Access Removal
- CC6.6: Multi-Factor Authentication
- CC6.7: Access Restrictions
- CC7.1: Security Incident Detection
- CC7.2: Incident Response
- CC8.1: Change Management

**ISO 27001 Annex A Controls (10)**:
- A.5.1.1: Information Security Policies
- A.6.1.2: Segregation of Duties
- A.9.2.1: User Registration and De-registration
- A.9.2.3: Management of Privileged Access Rights
- A.9.4.2: Secure Log-on Procedures
- A.9.4.3: Password Management System
- A.12.1.2: Change Management
- A.12.4.1: Event Logging
- A.16.1.1: Incident Response Responsibilities
- A.18.1.1: Identification of Applicable Legislation

---

## 📈 Reports Module

**Route:** `/reports`  
**Access:** Admin, Compliance Officer, External Auditor

### Available Reports

#### 1. Compliance Report (By Framework)
**Purpose**: Generate audit-ready documentation

**Steps**:
1. Select framework from dropdown
2. View detailed report
3. Download as text file

**Report Contents**:
- Framework name and version
- Report generation date
- For each requirement:
  - Requirement code and title
  - Mapped control(s)
  - Control status
  - Control owner
  - Evidence count
  - Last checked date

**Use Case**: Provide to auditors during SOC 2 or ISO 27001 audit

#### 2. Risk Register Report
**Purpose**: Complete risk documentation

**Contents**:
- Total risk count
- For each risk:
  - Title and description
  - Likelihood and Impact scores
  - Risk level
  - Category
  - Status
  - Owner
  - Mitigating controls
  - Created/Updated dates

**Download**: Available as text file

**Use Case**: Risk assessment reviews, board presentations

#### 3. Policy Acknowledgment Report
**Available from**: Policies page → Click "Report" on any policy

**Shows**:
- Policy title and version
- Total users who should acknowledge
- Number acknowledged
- Number pending
- Acknowledgment percentage
- Complete list of pending users

**Use Case**: Track policy compliance, send reminders

---

## 👥 User Management Module

**Route:** `/users`  
**Access:** Admin only

### Features

#### User List
- **View all users** with details:
  - Full name
  - Email address
  - Role (with color-coded badge)
  - Status (Active/Inactive)
  - Creation date

#### Add User
- **Required**:
  - Full name
  - Email (unique)
  - Password (minimum 8 characters)
  - Role selection
  
- **Automatic**:
  - Active status (default)
  - Creation timestamp
  - Password hashing (bcrypt)

#### Edit User
- Update full name
- Change role
- Toggle active status
- Cannot change email (unique identifier)

#### Role Assignment
- Admin (full access)
- Compliance Officer (manage compliance)
- External Auditor (read-only)
- Employee (policy acknowledgment)

---

## 🔔 Alerts & Notifications

**Route:** Dashboard (visible on all role dashboards)

### Features

#### Alert Types
- **Critical**: Major security events, failed controls
- **Warning**: Issues requiring attention
- **Info**: General notifications

#### Alert Display
- Title and description
- Severity indicator (color-coded)
- Related control (if applicable)
- Timestamp
- Resolution status

#### Alert Management
- View active alerts on dashboard
- Alerts can be marked as resolved
- Option to view resolved alerts (history)

---

## 🎨 User Interface Features

### Design System
- **Modern, clean interface**
- **Color-coded status indicators**:
  - 🟢 Green: Success, Implemented, Low risk
  - 🟡 Yellow: Warning, In Progress, Medium risk
  - 🔴 Red: Danger, Failed, High risk
  - ⚫ Gray: Inactive, Not Started
  - 🔵 Blue: Info, Primary actions

### Responsive Components
- **Tables**: Sortable, scrollable
- **Forms**: Client-side validation
- **Modals**: Smooth animations
- **Charts**: Interactive Recharts visualizations
- **Badges**: Color-coded status indicators
- **Cards**: Information grouping

### Navigation
- **Sidebar navigation** (role-based)
- **Breadcrumb trails**
- **Quick actions**
- **User profile display**
- **Sign out button**

---

## 📊 Data Visualization

### Chart Types
1. **Bar Charts**: Compliance progress by framework
2. **Pie Charts**: Risk distribution
3. **Progress Bars**: Policy acknowledgment rates, compliance percentages
4. **Metric Cards**: Key statistics with icons

### Interactive Features
- Hover tooltips
- Legend toggles
- Responsive sizing
- Export capabilities (via reports)

---

## 🔄 Continuous Monitoring

### Control Monitoring Hooks
The system includes hooks for automated control validation:

```python
# Example: Monitor control status
control.last_checked = datetime.utcnow()
if control_validation_fails():
    create_alert("Control Failed", control_id)
    control.status = ControlStatus.FAILED
```

### Alert Generation
- Automatic alerts for failed controls
- Configurable thresholds
- Integration points for external monitoring tools

---

## 📁 Evidence Management

### File Storage
- **Upload Types**: Any file type accepted
- **Storage**: Persistent Docker volume (`/app/evidence`)
- **Metadata**: File name, uploader, timestamp

### Evidence Types
1. **File Attachments**:
   - Screenshots
   - Policy documents
   - Configuration exports
   - Scan results
   
2. **Text Evidence**:
   - Policy excerpts
   - Procedure descriptions
   - Configuration details
   - Manual checks

### Best Practices
- Use descriptive titles
- Add detailed descriptions
- Upload regularly (quarterly minimum)
- Keep evidence current (match control last-checked date)

---

## 🎯 Audit Portal (External Auditor View)

### Purpose
Provide auditors with comprehensive, read-only access to all compliance data without risk of accidental modification.

### Features
- All data visible (controls, policies, risks, evidence)
- No edit buttons or forms
- Generate and download reports
- View evidence files
- Track compliance progress

### Use Case
- Share access during SOC 2 audit
- Provide to ISO 27001 auditors
- Third-party compliance reviews

---

## 🚀 Getting Started Tips

### For New Admins
1. Change default password immediately
2. Create user accounts for your team
3. Review pre-loaded frameworks and controls
4. Customize controls to match your environment
5. Upload evidence for implemented controls
6. Publish policies to employees
7. Start documenting risks

### For Compliance Officers
1. Familiarize yourself with frameworks
2. Map controls to your infrastructure
3. Set up regular evidence collection schedule
4. Generate baseline reports
5. Track policy acknowledgment rates

### For Employees
1. Check dashboard for pending policies
2. Acknowledge policies promptly
3. Contact compliance team with questions
4. Keep personal info updated

---

## 📞 Support & Resources

- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **API Docs**: http://localhost:8000/docs (when running)
- **Database Access**: `docker-compose exec db psql -U isms_user isms_db`

---

## 🎓 Training Recommendations

### Admin Training (2-4 hours)
1. System architecture overview
2. User management
3. Framework configuration
4. Control and evidence management
5. Report generation
6. Backup and maintenance

### Compliance Officer Training (1-2 hours)
1. Dashboard navigation
2. Control management
3. Evidence uploads
4. Policy publishing
5. Risk register management
6. Report generation

### Employee Training (15 minutes)
1. Login process
2. Policy acknowledgment workflow
3. Dashboard overview
4. Contact information for help

---

This comprehensive ISMS Platform provides everything needed for modern compliance management! 🚀🔒
