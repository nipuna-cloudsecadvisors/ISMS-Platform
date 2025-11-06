from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Enum as SQLEnum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

# Enums
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    COMPLIANCE_OFFICER = "compliance_officer"
    EXTERNAL_AUDITOR = "external_auditor"
    EMPLOYEE = "employee"

class ControlStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    IMPLEMENTED = "implemented"
    FAILED = "failed"

class RiskStatus(str, enum.Enum):
    IDENTIFIED = "identified"
    IN_PROGRESS = "in_progress"
    MITIGATED = "mitigated"
    ACCEPTED = "accepted"
    CLOSED = "closed"

class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Association tables for many-to-many relationships
control_requirement = Table(
    'control_requirement',
    Base.metadata,
    Column('control_id', Integer, ForeignKey('controls.id', ondelete='CASCADE')),
    Column('requirement_id', Integer, ForeignKey('requirements.id', ondelete='CASCADE'))
)

control_risk = Table(
    'control_risk',
    Base.metadata,
    Column('control_id', Integer, ForeignKey('controls.id', ondelete='CASCADE')),
    Column('risk_id', Integer, ForeignKey('risks.id', ondelete='CASCADE'))
)

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.EMPLOYEE)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    policy_acknowledgments = relationship("PolicyAcknowledgment", back_populates="user", cascade="all, delete-orphan")
    owned_controls = relationship("Control", back_populates="owner", foreign_keys="Control.owner_id")
    owned_risks = relationship("Risk", back_populates="owner", foreign_keys="Risk.owner_id")

# Framework Model (SOC 2, ISO 27001, etc.)
class Framework(Base):
    __tablename__ = "frameworks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text)
    version = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    requirements = relationship("Requirement", back_populates="framework", cascade="all, delete-orphan")

# Requirement Model (specific clauses/criteria within frameworks)
class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    framework_id = Column(Integer, ForeignKey("frameworks.id", ondelete="CASCADE"), nullable=False)
    code = Column(String, nullable=False)  # e.g., "CC6.2", "A.9.4.2"
    title = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    framework = relationship("Framework", back_populates="requirements")
    controls = relationship("Control", secondary=control_requirement, back_populates="requirements")

# Control Model
class Control(Base):
    __tablename__ = "controls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(SQLEnum(ControlStatus), nullable=False, default=ControlStatus.NOT_STARTED)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    implementation_details = Column(Text)
    last_checked = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="owned_controls", foreign_keys=[owner_id])
    requirements = relationship("Requirement", secondary=control_requirement, back_populates="controls")
    evidence = relationship("Evidence", back_populates="control", cascade="all, delete-orphan")
    risks = relationship("Risk", secondary=control_risk, back_populates="controls")

# Evidence Model
class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    file_path = Column(String)  # Path to uploaded file
    file_name = Column(String)
    content_text = Column(Text)  # For text-based evidence
    uploaded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    control = relationship("Control", back_populates="evidence")
    uploaded_by = relationship("User")

# Policy Model
class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    version = Column(String, default="1.0")
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    acknowledgments = relationship("PolicyAcknowledgment", back_populates="policy", cascade="all, delete-orphan")
    versions = relationship("PolicyVersion", back_populates="policy", cascade="all, delete-orphan")

# Policy Version Model (for version history)
class PolicyVersion(Base):
    __tablename__ = "policy_versions"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    version = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    policy = relationship("Policy", back_populates="versions")

# Policy Acknowledgment Model
class PolicyAcknowledgment(Base):
    __tablename__ = "policy_acknowledgments"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    policy_version = Column(String, nullable=False)
    acknowledged_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    policy = relationship("Policy", back_populates="acknowledgments")
    user = relationship("User", back_populates="policy_acknowledgments")

# Risk Model
class Risk(Base):
    __tablename__ = "risks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    likelihood = Column(Integer, nullable=False)  # 1-5
    impact = Column(Integer, nullable=False)  # 1-5
    risk_score = Column(Integer)  # Calculated: likelihood * impact
    risk_level = Column(SQLEnum(RiskLevel))  # Calculated based on score
    category = Column(String)
    status = Column(SQLEnum(RiskStatus), nullable=False, default=RiskStatus.IDENTIFIED)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="owned_risks", foreign_keys=[owner_id])
    controls = relationship("Control", secondary=control_risk, back_populates="risks")
    history = relationship("RiskHistory", back_populates="risk", cascade="all, delete-orphan")

# Risk History Model (audit trail for risk changes)
class RiskHistory(Base):
    __tablename__ = "risk_history"

    id = Column(Integer, primary_key=True, index=True)
    risk_id = Column(Integer, ForeignKey("risks.id", ondelete="CASCADE"), nullable=False)
    changed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    change_description = Column(Text, nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    risk = relationship("Risk", back_populates="history")
    changed_by = relationship("User")

# Alert/Notification Model
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    severity = Column(String, default="info")  # info, warning, critical
    is_resolved = Column(Boolean, default=False)
    related_control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True))

    # Relationships
    related_control = relationship("Control")
