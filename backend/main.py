from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import shutil
import os
from pathlib import Path

from database import get_db, engine
from models import Base, User, UserRole, Framework, Requirement, Control, Evidence, Policy, PolicyAcknowledgment, PolicyVersion, Risk, RiskHistory, Alert, RiskLevel, ControlStatus
from schemas import *
from auth import get_password_hash, verify_password, create_access_token, get_current_user, require_role

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ISMS Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Evidence file storage
EVIDENCE_DIR = Path("/app/evidence")
EVIDENCE_DIR.mkdir(exist_ok=True)

# ============ Authentication Endpoints ============

@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is inactive")
    
    access_token = create_access_token(data={"sub": user.email})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

# ============ User Management Endpoints ============

@app.post("/api/users", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)

@app.get("/api/users", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    users = db.query(User).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]

@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)

@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    if user_data.role is not None:
        user.role = user_data.role
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)

# ============ Framework Endpoints ============

@app.post("/api/frameworks", response_model=FrameworkResponse)
def create_framework(
    framework: FrameworkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    db_framework = Framework(**framework.model_dump())
    db.add(db_framework)
    db.commit()
    db.refresh(db_framework)
    return FrameworkResponse.model_validate(db_framework)

@app.get("/api/frameworks", response_model=List[FrameworkResponse])
def list_frameworks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    frameworks = db.query(Framework).all()
    return [FrameworkResponse.model_validate(f) for f in frameworks]

@app.get("/api/frameworks/{framework_id}", response_model=FrameworkResponse)
def get_framework(
    framework_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    framework = db.query(Framework).filter(Framework.id == framework_id).first()
    if not framework:
        raise HTTPException(status_code=404, detail="Framework not found")
    return FrameworkResponse.model_validate(framework)

# ============ Requirement Endpoints ============

@app.post("/api/requirements", response_model=RequirementResponse)
def create_requirement(
    requirement: RequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    db_requirement = Requirement(**requirement.model_dump())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return RequirementResponse.model_validate(db_requirement)

@app.get("/api/requirements", response_model=List[RequirementResponse])
def list_requirements(
    framework_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Requirement)
    if framework_id:
        query = query.filter(Requirement.framework_id == framework_id)
    requirements = query.all()
    return [RequirementResponse.model_validate(r) for r in requirements]

# ============ Control Endpoints ============

@app.post("/api/controls", response_model=ControlResponse)
def create_control(
    control_data: ControlCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    control = Control(
        title=control_data.title,
        description=control_data.description,
        status=control_data.status,
        owner_id=control_data.owner_id,
        implementation_details=control_data.implementation_details
    )
    
    # Add requirement mappings
    if control_data.requirement_ids:
        requirements = db.query(Requirement).filter(Requirement.id.in_(control_data.requirement_ids)).all()
        control.requirements = requirements
    
    db.add(control)
    db.commit()
    db.refresh(control)
    return ControlResponse.model_validate(control)

@app.get("/api/controls", response_model=List[ControlResponse])
def list_controls(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # External auditors have read-only access
    controls = db.query(Control).offset(skip).limit(limit).all()
    return [ControlResponse.model_validate(c) for c in controls]

@app.get("/api/controls/{control_id}", response_model=ControlResponse)
def get_control(
    control_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    return ControlResponse.model_validate(control)

@app.put("/api/controls/{control_id}", response_model=ControlResponse)
def update_control(
    control_id: int,
    control_data: ControlUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    
    update_data = control_data.model_dump(exclude_unset=True)
    requirement_ids = update_data.pop("requirement_ids", None)
    
    for key, value in update_data.items():
        setattr(control, key, value)
    
    if requirement_ids is not None:
        requirements = db.query(Requirement).filter(Requirement.id.in_(requirement_ids)).all()
        control.requirements = requirements
    
    control.last_checked = datetime.utcnow()
    db.commit()
    db.refresh(control)
    return ControlResponse.model_validate(control)

@app.delete("/api/controls/{control_id}")
def delete_control(
    control_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    db.delete(control)
    db.commit()
    return {"message": "Control deleted successfully"}

# ============ Evidence Endpoints ============

@app.post("/api/evidence", response_model=EvidenceResponse)
async def create_evidence(
    control_id: int,
    title: str,
    description: Optional[str] = None,
    content_text: Optional[str] = None,
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    control = db.query(Control).filter(Control.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    
    evidence = Evidence(
        control_id=control_id,
        title=title,
        description=description,
        content_text=content_text,
        uploaded_by_id=current_user.id
    )
    
    if file:
        # Save file
        file_path = EVIDENCE_DIR / f"{datetime.utcnow().timestamp()}_{file.filename}"
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        evidence.file_name = file.filename
        evidence.file_path = str(file_path)
    
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return EvidenceResponse.model_validate(evidence)

@app.get("/api/evidence", response_model=List[EvidenceResponse])
def list_evidence(
    control_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Evidence)
    if control_id:
        query = query.filter(Evidence.control_id == control_id)
    evidence = query.all()
    return [EvidenceResponse.model_validate(e) for e in evidence]

@app.delete("/api/evidence/{evidence_id}")
def delete_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    
    # Delete file if exists
    if evidence.file_path and os.path.exists(evidence.file_path):
        os.remove(evidence.file_path)
    
    db.delete(evidence)
    db.commit()
    return {"message": "Evidence deleted successfully"}

# ============ Policy Endpoints ============

@app.post("/api/policies", response_model=PolicyResponse)
def create_policy(
    policy_data: PolicyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    policy = Policy(**policy_data.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return PolicyResponse.model_validate(policy)

@app.get("/api/policies", response_model=List[PolicyResponse])
def list_policies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Employees only see published policies
    query = db.query(Policy)
    if current_user.role == UserRole.EMPLOYEE:
        query = query.filter(Policy.is_published == True)
    policies = query.all()
    return [PolicyResponse.model_validate(p) for p in policies]

@app.get("/api/policies/{policy_id}", response_model=PolicyResponse)
def get_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Employees can only view published policies
    if current_user.role == UserRole.EMPLOYEE and not policy.is_published:
        raise HTTPException(status_code=403, detail="Policy not accessible")
    
    return PolicyResponse.model_validate(policy)

@app.put("/api/policies/{policy_id}", response_model=PolicyResponse)
def update_policy(
    policy_id: int,
    policy_data: PolicyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Save current version to history before updating
    if policy_data.content and policy_data.content != policy.content:
        version = PolicyVersion(
            policy_id=policy.id,
            version=policy.version,
            content=policy.content
        )
        db.add(version)
    
    update_data = policy_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(policy, key, value)
    
    db.commit()
    db.refresh(policy)
    return PolicyResponse.model_validate(policy)

@app.post("/api/policies/{policy_id}/publish")
def publish_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # If republishing, clear previous acknowledgments for this version
    if policy.is_published:
        db.query(PolicyAcknowledgment).filter(
            PolicyAcknowledgment.policy_id == policy_id,
            PolicyAcknowledgment.policy_version == policy.version
        ).delete()
    
    policy.is_published = True
    policy.published_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Policy published successfully"}

@app.delete("/api/policies/{policy_id}")
def delete_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    db.delete(policy)
    db.commit()
    return {"message": "Policy deleted successfully"}

# ============ Policy Acknowledgment Endpoints ============

@app.post("/api/policy-acknowledgments", response_model=PolicyAcknowledgmentResponse)
def acknowledge_policy(
    ack_data: PolicyAcknowledgmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    policy = db.query(Policy).filter(Policy.id == ack_data.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Check if already acknowledged
    existing = db.query(PolicyAcknowledgment).filter(
        PolicyAcknowledgment.policy_id == ack_data.policy_id,
        PolicyAcknowledgment.user_id == current_user.id,
        PolicyAcknowledgment.policy_version == policy.version
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Policy already acknowledged")
    
    acknowledgment = PolicyAcknowledgment(
        policy_id=ack_data.policy_id,
        user_id=current_user.id,
        policy_version=policy.version
    )
    db.add(acknowledgment)
    db.commit()
    db.refresh(acknowledgment)
    return PolicyAcknowledgmentResponse.model_validate(acknowledgment)

@app.get("/api/policy-acknowledgments/pending", response_model=List[PolicyResponse])
def get_pending_acknowledgments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get all published policies
    published_policies = db.query(Policy).filter(Policy.is_published == True).all()
    
    # Filter out already acknowledged
    pending = []
    for policy in published_policies:
        ack = db.query(PolicyAcknowledgment).filter(
            PolicyAcknowledgment.policy_id == policy.id,
            PolicyAcknowledgment.user_id == current_user.id,
            PolicyAcknowledgment.policy_version == policy.version
        ).first()
        
        if not ack:
            pending.append(policy)
    
    return [PolicyResponse.model_validate(p) for p in pending]

# ============ Risk Endpoints ============

@app.post("/api/risks", response_model=RiskResponse)
def create_risk(
    risk_data: RiskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    # Calculate risk score and level
    risk_score = risk_data.likelihood * risk_data.impact
    
    if risk_score >= 20:
        risk_level = RiskLevel.CRITICAL
    elif risk_score >= 12:
        risk_level = RiskLevel.HIGH
    elif risk_score >= 6:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW
    
    risk = Risk(
        title=risk_data.title,
        description=risk_data.description,
        likelihood=risk_data.likelihood,
        impact=risk_data.impact,
        risk_score=risk_score,
        risk_level=risk_level,
        category=risk_data.category,
        status=risk_data.status,
        owner_id=risk_data.owner_id
    )
    
    # Add control mappings
    if risk_data.control_ids:
        controls = db.query(Control).filter(Control.id.in_(risk_data.control_ids)).all()
        risk.controls = controls
    
    db.add(risk)
    db.commit()
    db.refresh(risk)
    
    # Create history entry
    history = RiskHistory(
        risk_id=risk.id,
        changed_by_id=current_user.id,
        change_description=f"Risk created with status: {risk.status}"
    )
    db.add(history)
    db.commit()
    
    return RiskResponse.model_validate(risk)

@app.get("/api/risks", response_model=List[RiskResponse])
def list_risks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    risks = db.query(Risk).offset(skip).limit(limit).all()
    return [RiskResponse.model_validate(r) for r in risks]

@app.get("/api/risks/{risk_id}", response_model=RiskResponse)
def get_risk(
    risk_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return RiskResponse.model_validate(risk)

@app.put("/api/risks/{risk_id}", response_model=RiskResponse)
def update_risk(
    risk_id: int,
    risk_data: RiskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    
    update_data = risk_data.model_dump(exclude_unset=True)
    control_ids = update_data.pop("control_ids", None)
    
    changes = []
    for key, value in update_data.items():
        if value is not None and getattr(risk, key) != value:
            changes.append(f"{key}: {getattr(risk, key)} -> {value}")
            setattr(risk, key, value)
    
    # Recalculate risk score if likelihood or impact changed
    if risk_data.likelihood is not None or risk_data.impact is not None:
        risk.risk_score = risk.likelihood * risk.impact
        
        if risk.risk_score >= 20:
            risk.risk_level = RiskLevel.CRITICAL
        elif risk.risk_score >= 12:
            risk.risk_level = RiskLevel.HIGH
        elif risk.risk_score >= 6:
            risk.risk_level = RiskLevel.MEDIUM
        else:
            risk.risk_level = RiskLevel.LOW
    
    if control_ids is not None:
        controls = db.query(Control).filter(Control.id.in_(control_ids)).all()
        risk.controls = controls
        changes.append(f"Controls updated")
    
    db.commit()
    
    # Create history entry
    if changes:
        history = RiskHistory(
            risk_id=risk.id,
            changed_by_id=current_user.id,
            change_description="; ".join(changes)
        )
        db.add(history)
        db.commit()
    
    db.refresh(risk)
    return RiskResponse.model_validate(risk)

@app.delete("/api/risks/{risk_id}")
def delete_risk(
    risk_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    db.delete(risk)
    db.commit()
    return {"message": "Risk deleted successfully"}

# ============ Alert Endpoints ============

@app.get("/api/alerts", response_model=List[AlertResponse])
def list_alerts(
    include_resolved: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert)
    if not include_resolved:
        query = query.filter(Alert.is_resolved == False)
    alerts = query.order_by(Alert.created_at.desc()).all()
    return [AlertResponse.model_validate(a) for a in alerts]

# ============ Dashboard Endpoints ============

@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Compliance progress by framework
    frameworks = db.query(Framework).all()
    compliance_progress = []
    
    for framework in frameworks:
        # Get all requirements for this framework
        requirement_ids = [r.id for r in framework.requirements]
        
        # Get controls mapped to these requirements
        controls = db.query(Control).join(Control.requirements).filter(
            Requirement.id.in_(requirement_ids)
        ).distinct().all()
        
        total_controls = len(controls)
        implemented_controls = len([c for c in controls if c.status == ControlStatus.IMPLEMENTED])
        
        progress = ComplianceProgress(
            framework_id=framework.id,
            framework_name=framework.name,
            total_controls=total_controls,
            implemented_controls=implemented_controls,
            progress_percentage=round((implemented_controls / total_controls * 100) if total_controls > 0 else 0, 2)
        )
        compliance_progress.append(progress)
    
    # Risk statistics
    risks = db.query(Risk).all()
    risk_counts = {
        RiskLevel.HIGH: 0,
        RiskLevel.CRITICAL: 0,
        RiskLevel.MEDIUM: 0,
        RiskLevel.LOW: 0
    }
    for risk in risks:
        risk_counts[risk.risk_level] += 1
    
    # Pending acknowledgments
    if current_user.role == UserRole.EMPLOYEE:
        published_policies = db.query(Policy).filter(Policy.is_published == True).all()
        pending_count = 0
        for policy in published_policies:
            ack = db.query(PolicyAcknowledgment).filter(
                PolicyAcknowledgment.policy_id == policy.id,
                PolicyAcknowledgment.user_id == current_user.id,
                PolicyAcknowledgment.policy_version == policy.version
            ).first()
            if not ack:
                pending_count += 1
    else:
        # For admins, show total pending across all users
        total_users = db.query(User).filter(User.role == UserRole.EMPLOYEE).count()
        published_policies = db.query(Policy).filter(Policy.is_published == True).count()
        total_expected = total_users * published_policies
        total_acknowledged = db.query(PolicyAcknowledgment).count()
        pending_count = total_expected - total_acknowledged
    
    # Active alerts
    active_alerts = db.query(Alert).filter(Alert.is_resolved == False).count()
    
    # Controls lacking evidence
    controls_lacking_evidence = db.query(Control).outerjoin(Evidence).filter(Evidence.id == None).count()
    
    return DashboardStats(
        compliance_progress=compliance_progress,
        total_risks=len(risks),
        high_risks=risk_counts[RiskLevel.HIGH] + risk_counts[RiskLevel.CRITICAL],
        medium_risks=risk_counts[RiskLevel.MEDIUM],
        low_risks=risk_counts[RiskLevel.LOW],
        pending_acknowledgments=pending_count,
        active_alerts=active_alerts,
        controls_lacking_evidence=controls_lacking_evidence
    )

# ============ Report Endpoints ============

@app.get("/api/reports/policy-acknowledgments/{policy_id}", response_model=PolicyAcknowledgmentReport)
def get_policy_acknowledgment_report(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER]))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Get all employees
    all_users = db.query(User).filter(User.role == UserRole.EMPLOYEE, User.is_active == True).all()
    
    # Get acknowledgments for current version
    acknowledgments = db.query(PolicyAcknowledgment).filter(
        PolicyAcknowledgment.policy_id == policy_id,
        PolicyAcknowledgment.policy_version == policy.version
    ).all()
    
    acknowledged_user_ids = {ack.user_id for ack in acknowledgments}
    pending_users = [u for u in all_users if u.id not in acknowledged_user_ids]
    
    total_users = len(all_users)
    acknowledged_count = len(acknowledged_user_ids)
    pending_count = len(pending_users)
    
    return PolicyAcknowledgmentReport(
        policy_id=policy.id,
        policy_title=policy.title,
        policy_version=policy.version,
        total_users=total_users,
        acknowledged_count=acknowledged_count,
        pending_count=pending_count,
        acknowledgment_rate=round((acknowledged_count / total_users * 100) if total_users > 0 else 0, 2),
        pending_users=[UserResponse.model_validate(u) for u in pending_users]
    )

@app.get("/api/reports/risk-register")
def get_risk_register_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    risks = db.query(Risk).all()
    
    report = []
    for risk in risks:
        owner_name = risk.owner.full_name if risk.owner else "Unassigned"
        control_titles = [c.title for c in risk.controls]
        
        report.append({
            "id": risk.id,
            "title": risk.title,
            "description": risk.description,
            "likelihood": risk.likelihood,
            "impact": risk.impact,
            "risk_score": risk.risk_score,
            "risk_level": risk.risk_level,
            "category": risk.category,
            "status": risk.status,
            "owner": owner_name,
            "mitigating_controls": control_titles,
            "created_at": risk.created_at.isoformat(),
            "updated_at": risk.updated_at.isoformat() if risk.updated_at else None
        })
    
    return {"risks": report, "total_count": len(report)}

@app.get("/api/reports/compliance/{framework_id}")
def get_compliance_report(
    framework_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    framework = db.query(Framework).filter(Framework.id == framework_id).first()
    if not framework:
        raise HTTPException(status_code=404, detail="Framework not found")
    
    requirements = db.query(Requirement).filter(Requirement.framework_id == framework_id).all()
    
    report = []
    for req in requirements:
        controls = req.controls
        
        for control in controls:
            evidence_count = len(control.evidence)
            owner_name = control.owner.full_name if control.owner else "Unassigned"
            
            report.append({
                "requirement_code": req.code,
                "requirement_title": req.title,
                "requirement_description": req.description,
                "control_id": control.id,
                "control_title": control.title,
                "control_status": control.status,
                "control_owner": owner_name,
                "evidence_count": evidence_count,
                "last_checked": control.last_checked.isoformat() if control.last_checked else None
            })
    
    return {
        "framework_name": framework.name,
        "framework_version": framework.version,
        "report_date": datetime.utcnow().isoformat(),
        "requirements": report
    }

@app.get("/")
def root():
    return {"message": "ISMS Platform API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
