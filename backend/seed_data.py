import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, UserRole, Framework, Requirement, Control, Policy, ControlStatus
from auth import get_password_hash

def seed_database():
    """Seed the database with initial data"""
    db = SessionLocal()
    
    try:
        print("Starting database seeding...")
        
        # Create admin user if not exists
        admin_email = os.getenv("ADMIN_EMAIL", "admin@isms.local")
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if not admin:
            print(f"Creating admin user: {admin_email}")
            admin = User(
                email=admin_email,
                full_name="System Administrator",
                role=UserRole.ADMIN,
                hashed_password=get_password_hash(os.getenv("ADMIN_PASSWORD", "admin123"))
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        
        # Create demo users
        demo_users = [
            {"email": "compliance@isms.local", "full_name": "Compliance Officer", "role": UserRole.COMPLIANCE_OFFICER, "password": "compliance123"},
            {"email": "auditor@external.com", "full_name": "External Auditor", "role": UserRole.EXTERNAL_AUDITOR, "password": "auditor123"},
            {"email": "employee@isms.local", "full_name": "John Employee", "role": UserRole.EMPLOYEE, "password": "employee123"},
        ]
        
        for user_data in demo_users:
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing:
                print(f"Creating demo user: {user_data['email']}")
                user = User(
                    email=user_data["email"],
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    hashed_password=get_password_hash(user_data["password"])
                )
                db.add(user)
        
        db.commit()
        
        # Check if frameworks already exist
        if db.query(Framework).count() > 0:
            print("Frameworks already exist, skipping framework seeding")
            return
        
        # Create SOC 2 Framework
        print("Creating SOC 2 framework...")
        soc2 = Framework(
            name="SOC 2 Type 2",
            description="Service Organization Control 2 - Security, Availability, Processing Integrity, Confidentiality, and Privacy",
            version="2017"
        )
        db.add(soc2)
        db.commit()
        db.refresh(soc2)
        
        # SOC 2 Requirements (Trust Services Criteria)
        soc2_requirements = [
            {"code": "CC1.1", "title": "Control Environment - Integrity and Ethics", "description": "The entity demonstrates a commitment to integrity and ethical values"},
            {"code": "CC1.2", "title": "Board Independence and Oversight", "description": "The board of directors demonstrates independence from management"},
            {"code": "CC6.1", "title": "Logical Access Controls", "description": "The entity implements logical access security software, infrastructure, and architectures"},
            {"code": "CC6.2", "title": "Access Authorization", "description": "Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users"},
            {"code": "CC6.3", "title": "User Access Removal", "description": "The entity removes access to the system when appropriate"},
            {"code": "CC6.6", "title": "Multi-Factor Authentication", "description": "The entity implements multi-factor authentication for accessing the system"},
            {"code": "CC6.7", "title": "Access Restrictions", "description": "The entity restricts the transmission, movement, and removal of information"},
            {"code": "CC7.1", "title": "Security Incident Detection", "description": "The entity uses detection tools and monitoring procedures to identify anomalies"},
            {"code": "CC7.2", "title": "Incident Response", "description": "The entity monitors system components and the operation of those components"},
            {"code": "CC8.1", "title": "Change Management", "description": "The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure"},
        ]
        
        for req_data in soc2_requirements:
            req = Requirement(framework_id=soc2.id, **req_data)
            db.add(req)
        
        db.commit()
        print(f"Created {len(soc2_requirements)} SOC 2 requirements")
        
        # Create ISO 27001 Framework
        print("Creating ISO 27001 framework...")
        iso27001 = Framework(
            name="ISO 27001:2013",
            description="International Standard for Information Security Management Systems",
            version="2013"
        )
        db.add(iso27001)
        db.commit()
        db.refresh(iso27001)
        
        # ISO 27001 Requirements (Annex A Controls - selection)
        iso_requirements = [
            {"code": "A.5.1.1", "title": "Information Security Policies", "description": "A set of policies for information security shall be defined"},
            {"code": "A.6.1.2", "title": "Segregation of Duties", "description": "Conflicting duties and areas of responsibility shall be segregated"},
            {"code": "A.9.2.1", "title": "User Registration and De-registration", "description": "A formal user registration and de-registration process shall be implemented"},
            {"code": "A.9.2.3", "title": "Management of Privileged Access Rights", "description": "The allocation and use of privileged access rights shall be restricted and controlled"},
            {"code": "A.9.4.2", "title": "Secure Log-on Procedures", "description": "Access to systems and applications shall be controlled by a secure log-on procedure"},
            {"code": "A.9.4.3", "title": "Password Management System", "description": "Password management systems shall be interactive and ensure quality passwords"},
            {"code": "A.12.1.2", "title": "Change Management", "description": "Changes to the organization, business processes, information processing facilities shall be controlled"},
            {"code": "A.12.4.1", "title": "Event Logging", "description": "Event logs recording user activities, exceptions, faults and information security events shall be produced"},
            {"code": "A.16.1.1", "title": "Responsibilities and Procedures for Incident Response", "description": "Management responsibilities and procedures shall be established"},
            {"code": "A.18.1.1", "title": "Identification of Applicable Legislation", "description": "All relevant legislative statutory, regulatory, contractual requirements shall be identified"},
        ]
        
        for req_data in iso_requirements:
            req = Requirement(framework_id=iso27001.id, **req_data)
            db.add(req)
        
        db.commit()
        print(f"Created {len(iso_requirements)} ISO 27001 requirements")
        
        # Get requirement IDs for mapping
        soc2_reqs = db.query(Requirement).filter(Requirement.framework_id == soc2.id).all()
        iso_reqs = db.query(Requirement).filter(Requirement.framework_id == iso27001.id).all()
        
        # Create sample controls
        print("Creating sample controls...")
        controls_data = [
            {
                "title": "Multi-Factor Authentication (MFA) Enforcement",
                "description": "All users must authenticate using MFA for accessing critical systems and applications",
                "status": ControlStatus.IMPLEMENTED,
                "implementation_details": "MFA enabled via SSO provider for all production systems",
                "requirements": ["CC6.6", "A.9.4.2"]
            },
            {
                "title": "User Access Review Process",
                "description": "Quarterly review of user access rights and permissions",
                "status": ControlStatus.IMPLEMENTED,
                "implementation_details": "Automated access review process with manager approval workflow",
                "requirements": ["CC6.2", "A.9.2.3"]
            },
            {
                "title": "User Offboarding Procedure",
                "description": "Immediate revocation of access upon employee termination",
                "status": ControlStatus.IMPLEMENTED,
                "implementation_details": "Automated deprovisioning tied to HR system",
                "requirements": ["CC6.3", "A.9.2.1"]
            },
            {
                "title": "Security Information and Event Monitoring (SIEM)",
                "description": "24/7 monitoring of security events and anomalies",
                "status": ControlStatus.IN_PROGRESS,
                "implementation_details": "SIEM tool deployed, tuning alert rules in progress",
                "requirements": ["CC7.1", "A.12.4.1"]
            },
            {
                "title": "Incident Response Plan",
                "description": "Documented procedures for detecting, responding to, and recovering from security incidents",
                "status": ControlStatus.IMPLEMENTED,
                "implementation_details": "IR plan documented and tested quarterly",
                "requirements": ["CC7.2", "A.16.1.1"]
            },
            {
                "title": "Change Management Process",
                "description": "All changes to production systems follow a documented approval process",
                "status": ControlStatus.IMPLEMENTED,
                "implementation_details": "Ticketing system with approval workflow and rollback procedures",
                "requirements": ["CC8.1", "A.12.1.2"]
            },
            {
                "title": "Information Security Policy Suite",
                "description": "Comprehensive set of security policies covering all aspects of information security",
                "status": ControlStatus.IMPLEMENTED,
                "implementation_details": "Policies reviewed and approved annually by management",
                "requirements": ["CC1.1", "A.5.1.1"]
            },
            {
                "title": "Password Complexity Requirements",
                "description": "Enforce strong password policies across all systems",
                "status": ControlStatus.IMPLEMENTED,
                "implementation_details": "Minimum 12 characters, complexity requirements enforced",
                "requirements": ["A.9.4.3"]
            },
            {
                "title": "Segregation of Duties",
                "description": "Critical functions require multiple approvals to prevent fraud",
                "status": ControlStatus.IN_PROGRESS,
                "implementation_details": "SoD matrix created, implementing in financial systems",
                "requirements": ["A.6.1.2"]
            },
            {
                "title": "Compliance Training Program",
                "description": "Annual security awareness training for all employees",
                "status": ControlStatus.NOT_STARTED,
                "implementation_details": "Training platform selected, content being developed",
                "requirements": ["CC1.1", "A.18.1.1"]
            },
        ]
        
        # Create a mapping of requirement codes to IDs
        req_code_to_id = {}
        for req in soc2_reqs + iso_reqs:
            req_code_to_id[req.code] = req.id
        
        for control_data in controls_data:
            req_codes = control_data.pop("requirements", [])
            control = Control(
                **control_data,
                owner_id=admin.id
            )
            
            # Map requirements
            for code in req_codes:
                if code in req_code_to_id:
                    req = db.query(Requirement).filter(Requirement.id == req_code_to_id[code]).first()
                    if req:
                        control.requirements.append(req)
            
            db.add(control)
        
        db.commit()
        print(f"Created {len(controls_data)} sample controls")
        
        # Create policy templates
        print("Creating policy templates...")
        policies = [
            {
                "title": "Information Security Policy",
                "content": """# Information Security Policy

## 1. Purpose
This policy establishes the framework for protecting [Company Name]'s information assets and ensuring the confidentiality, integrity, and availability of information.

## 2. Scope
This policy applies to all employees, contractors, vendors, and third parties who have access to company information systems.

## 3. Policy Statements

### 3.1 Information Classification
All information must be classified according to its sensitivity level (Public, Internal, Confidential, Restricted).

### 3.2 Access Control
Access to information systems shall be granted based on the principle of least privilege and need-to-know basis.

### 3.3 Physical Security
Physical access to facilities containing information systems shall be restricted and monitored.

### 3.4 Incident Response
All suspected or actual security incidents must be reported immediately to the Security Team.

### 3.5 Compliance
All personnel must comply with applicable laws, regulations, and contractual obligations related to information security.

## 4. Responsibilities
- **Employees**: Protect information assets and report security concerns
- **Managers**: Ensure team members understand and comply with security policies
- **Security Team**: Monitor, maintain, and enforce security controls
- **IT Department**: Implement technical security measures

## 5. Enforcement
Violations of this policy may result in disciplinary action, up to and including termination.

## 6. Review
This policy will be reviewed annually and updated as necessary.

**Effective Date**: [Date]
**Last Reviewed**: [Date]
**Policy Owner**: Chief Information Security Officer
"""
            },
            {
                "title": "Acceptable Use Policy",
                "content": """# Acceptable Use Policy

## 1. Purpose
This policy outlines the acceptable use of [Company Name]'s information technology resources.

## 2. Scope
This policy applies to all users of company IT resources, including employees, contractors, and visitors.

## 3. Acceptable Use

### 3.1 Business Use
Company IT resources are provided for business purposes. Limited personal use is permitted if it does not interfere with job duties.

### 3.2 Account Security
- Users must keep passwords confidential
- Do not share accounts or credentials
- Lock workstations when unattended
- Report lost or stolen devices immediately

### 3.3 Email and Communication
- Use professional language in business communications
- Do not send confidential information via unencrypted email
- Be cautious of phishing attempts

## 4. Prohibited Activities
The following activities are strictly prohibited:
- Unauthorized access to systems or data
- Installing unlicensed software
- Downloading or distributing malicious software
- Harassment or discrimination via company systems
- Using company resources for illegal activities
- Attempting to bypass security controls

## 5. Monitoring
The company reserves the right to monitor all use of IT resources to ensure compliance with this policy.

## 6. Consequences
Violations may result in disciplinary action, including termination and legal action.

**Effective Date**: [Date]
**Policy Owner**: IT Director
"""
            },
            {
                "title": "Access Control Policy",
                "content": """# Access Control Policy

## 1. Purpose
Define requirements for granting, managing, and revoking access to information systems and data.

## 2. Scope
Applies to all systems, applications, and data repositories.

## 3. Access Request Process

### 3.1 User Access Requests
- Access must be requested through the IT ticketing system
- Requests require manager approval
- Access is granted based on job role and responsibilities

### 3.2 Privileged Access
- Privileged access requires additional approval from Security Team
- Must have documented business justification
- Subject to enhanced monitoring

## 4. Multi-Factor Authentication
MFA is required for:
- Remote access to corporate network
- Access to cloud applications
- Privileged accounts
- Access to sensitive data

## 5. Password Requirements
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and special characters
- Changed every 90 days
- Cannot reuse last 5 passwords

## 6. Access Review
- User access rights reviewed quarterly
- Manager approval required for continued access
- Unused accounts disabled after 30 days of inactivity

## 7. Access Revocation
Access must be revoked:
- Immediately upon termination
- Within 24 hours of role change
- When access is no longer needed

**Effective Date**: [Date]
**Policy Owner**: Chief Information Security Officer
"""
            },
            {
                "title": "Incident Response Policy",
                "content": """# Incident Response Policy

## 1. Purpose
Establish procedures for detecting, responding to, and recovering from security incidents.

## 2. Definitions
A security incident is any event that compromises the confidentiality, integrity, or availability of information or systems.

## 3. Incident Classification

### 3.1 Severity Levels
- **Critical**: Major service outage or data breach
- **High**: Significant threat to security or operations
- **Medium**: Potential security concern
- **Low**: Minor issue with minimal impact

## 4. Incident Response Process

### 4.1 Detection and Reporting
- All personnel must report suspected incidents immediately
- Contact Security Team: security@company.com or ext. 911
- Do not attempt to investigate on your own

### 4.2 Initial Response
- Security Team assesses and classifies the incident
- Incident Commander assigned for Critical/High incidents
- Initial containment actions taken

### 4.3 Investigation
- Preserve evidence
- Document all actions
- Identify root cause
- Assess impact

### 4.4 Containment and Eradication
- Isolate affected systems
- Remove threat
- Patch vulnerabilities

### 4.5 Recovery
- Restore systems from clean backups
- Verify system integrity
- Return to normal operations

### 4.6 Post-Incident Review
- Document lessons learned
- Update procedures
- Implement preventive measures

## 5. Communication
- Internal: Management notified for High/Critical incidents
- External: Legal and PR consulted before external communication
- Regulatory: Comply with breach notification requirements

## 6. Training
All personnel receive annual incident response training.

**Effective Date**: [Date]
**Policy Owner**: Chief Information Security Officer
"""
            },
            {
                "title": "Data Protection and Privacy Policy",
                "content": """# Data Protection and Privacy Policy

## 1. Purpose
Protect personal and sensitive data in compliance with privacy regulations.

## 2. Scope
Applies to all processing of personal data by [Company Name].

## 3. Data Classification

### 3.1 Personal Data
Information that identifies an individual (name, email, phone, etc.)

### 3.2 Sensitive Data
Special categories requiring extra protection (financial data, health records, etc.)

## 4. Data Collection
- Collect only data necessary for business purposes
- Obtain consent where required
- Provide clear privacy notices

## 5. Data Use and Disclosure
- Use data only for stated purposes
- Do not sell personal data
- Disclose only with consent or legal requirement

## 6. Data Storage and Security
- Encrypt sensitive data at rest and in transit
- Store data only in approved locations
- Implement access controls

## 7. Data Retention
- Retain data only as long as necessary
- Follow retention schedule
- Securely delete when no longer needed

## 8. Data Subject Rights
Individuals have the right to:
- Access their data
- Correct inaccuracies
- Request deletion
- Object to processing
- Data portability

## 9. Data Breach Response
- Report breaches to Privacy Officer within 24 hours
- Notify affected individuals and regulators as required
- Document all breaches

## 10. Third-Party Data Processing
- Vet vendors for security and privacy practices
- Execute Data Processing Agreements
- Monitor vendor compliance

## 11. Training
All personnel handling personal data receive privacy training.

**Effective Date**: [Date]
**Policy Owner**: Privacy Officer / DPO
"""
            }
        ]
        
        for policy_data in policies:
            policy = Policy(**policy_data)
            db.add(policy)
        
        db.commit()
        print(f"Created {len(policies)} policy templates")
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
