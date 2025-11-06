from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import UserRole, ControlStatus, RiskStatus, RiskLevel

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Framework Schemas
class FrameworkBase(BaseModel):
    name: str
    description: Optional[str] = None
    version: Optional[str] = None

class FrameworkCreate(FrameworkBase):
    pass

class FrameworkResponse(FrameworkBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Requirement Schemas
class RequirementBase(BaseModel):
    code: str
    title: str
    description: Optional[str] = None

class RequirementCreate(RequirementBase):
    framework_id: int

class RequirementResponse(RequirementBase):
    id: int
    framework_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Control Schemas
class ControlBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: ControlStatus = ControlStatus.NOT_STARTED
    implementation_details: Optional[str] = None

class ControlCreate(ControlBase):
    owner_id: Optional[int] = None
    requirement_ids: List[int] = []

class ControlUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ControlStatus] = None
    owner_id: Optional[int] = None
    implementation_details: Optional[str] = None
    requirement_ids: Optional[List[int]] = None

class ControlResponse(ControlBase):
    id: int
    owner_id: Optional[int]
    last_checked: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Evidence Schemas
class EvidenceBase(BaseModel):
    title: str
    description: Optional[str] = None
    content_text: Optional[str] = None

class EvidenceCreate(EvidenceBase):
    control_id: int

class EvidenceResponse(EvidenceBase):
    id: int
    control_id: int
    file_name: Optional[str]
    file_path: Optional[str]
    uploaded_by_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# Policy Schemas
class PolicyBase(BaseModel):
    title: str
    content: str

class PolicyCreate(PolicyBase):
    pass

class PolicyUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    version: Optional[str] = None

class PolicyResponse(PolicyBase):
    id: int
    version: str
    is_published: bool
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Policy Acknowledgment Schemas
class PolicyAcknowledgmentCreate(BaseModel):
    policy_id: int

class PolicyAcknowledgmentResponse(BaseModel):
    id: int
    policy_id: int
    user_id: int
    policy_version: str
    acknowledged_at: datetime

    class Config:
        from_attributes = True

# Risk Schemas
class RiskBase(BaseModel):
    title: str
    description: Optional[str] = None
    likelihood: int = Field(..., ge=1, le=5)
    impact: int = Field(..., ge=1, le=5)
    category: Optional[str] = None
    status: RiskStatus = RiskStatus.IDENTIFIED

class RiskCreate(RiskBase):
    owner_id: Optional[int] = None
    control_ids: List[int] = []

class RiskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    likelihood: Optional[int] = Field(None, ge=1, le=5)
    impact: Optional[int] = Field(None, ge=1, le=5)
    category: Optional[str] = None
    status: Optional[RiskStatus] = None
    owner_id: Optional[int] = None
    control_ids: Optional[List[int]] = None

class RiskResponse(RiskBase):
    id: int
    risk_score: int
    risk_level: RiskLevel
    owner_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Alert Schemas
class AlertResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    severity: str
    is_resolved: bool
    related_control_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Schemas
class ComplianceProgress(BaseModel):
    framework_id: int
    framework_name: str
    total_controls: int
    implemented_controls: int
    progress_percentage: float

class DashboardStats(BaseModel):
    compliance_progress: List[ComplianceProgress]
    total_risks: int
    high_risks: int
    medium_risks: int
    low_risks: int
    pending_acknowledgments: int
    active_alerts: int
    controls_lacking_evidence: int

# Report Schemas
class PolicyAcknowledgmentReport(BaseModel):
    policy_id: int
    policy_title: str
    policy_version: str
    total_users: int
    acknowledged_count: int
    pending_count: int
    acknowledgment_rate: float
    pending_users: List[UserResponse]
