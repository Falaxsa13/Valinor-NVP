# models.py

from sqlalchemy import Column, Integer, String, Date, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import date
from typing import List, Dict, Optional
from pydantic import BaseModel, EmailStr, Field, root_validator

# Import the SQLAlchemy Base from your database configuration.
from database import Base

# =======================================
# SQLAlchemy Models (Database Tables)
# =======================================


# --- Template Models ---
class TemplateModel(Base):
    __tablename__ = "templates"

    id = Column(String, primary_key=True, index=True)  # Use the provided template id.
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    icon = Column(JSON, nullable=True)  # Store icon information as JSON.

    # A template has many sections.
    sections = relationship(
        "TemplateSectionModel", back_populates="template", cascade="all, delete-orphan"
    )

    # Fix: This allows the template to access all its projects
    projects = relationship("Project", back_populates="template")


class TemplateSectionModel(Base):
    __tablename__ = "template_sections"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(String, ForeignKey("templates.id"), nullable=False)
    title = Column(String, nullable=False)

    # A section has many subtitles.
    subtitles = relationship(
        "TemplateSubtitleModel", back_populates="section", cascade="all, delete-orphan"
    )
    template = relationship("TemplateModel", back_populates="sections")


class TemplateSubtitleModel(Base):
    __tablename__ = "template_subtitles"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("template_sections.id"), nullable=False)
    subtitle = Column(String, nullable=False)

    section = relationship("TemplateSectionModel", back_populates="subtitles")


# --- Project Model ---
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    deadline = Column(Date, nullable=False)

    # Instead of storing the entire template as JSON, store its ID.
    template_id = Column(String, ForeignKey("templates.id"), nullable=False)

    template = relationship("TemplateModel", back_populates="projects")

    timeline_entries = relationship(
        "TimelineEntry", back_populates="project", cascade="all, delete-orphan"
    )

    collaborators = relationship(
        "ProjectCollaborator", back_populates="project", cascade="all, delete-orphan"
    )

    assignments = relationship(
        "ProjectAssignment", back_populates="project", cascade="all, delete-orphan"
    )


# --- Project Collaborators ---
class ProjectCollaborator(Base):
    __tablename__ = "project_collaborators"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    email = Column(String, nullable=False)  # Email of the collaborator

    project = relationship("Project", back_populates="collaborators")


# --- Project Assignments ---
class ProjectAssignment(Base):
    __tablename__ = "project_assignments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    section = Column(String, nullable=False)  # Section name
    assigned_email = Column(String, nullable=False)  # Assigned user email

    project = relationship("Project", back_populates="assignments")


# --- Timeline Entry Model ---
class TimelineEntry(Base):
    __tablename__ = "timeline_entries"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    section = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    responsible = Column(String, nullable=True)
    start = Column(Date, nullable=False)
    end = Column(Date, nullable=False)

    project = relationship("Project", back_populates="timeline_entries")


# =======================================
# Pydantic Models (API Request/Response)
# =======================================


# --- Template Pydantic Models ---
class TemplateSection(BaseModel):
    title: str
    subtitles: List[str]

    class Config:
        from_attributes = True


class TemplateIcon(BaseModel):
    type: dict = {}
    key: Optional[str] = None
    props: dict
    owner: Optional[str] = None  # Renamed from _owner
    store: dict = {}  # Renamed from _store

    class Config:
        from_attributes = True  # Updated for Pydantic v2


class TemplateStructure(BaseModel):
    sections: List[TemplateSection]

    class Config:
        from_attributes = True


class Template(BaseModel):
    id: str
    name: str
    description: str
    icon: TemplateIcon
    structure: TemplateStructure

    class Config:
        from_attributes = True


# --- Project Pydantic Models ---
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: date
    deadline: date


class ProjectCreate(ProjectBase):
    template_id: str


class TimelineEntryBase(BaseModel):
    section: str
    subtitle: Optional[str] = None
    responsible: Optional[str] = None
    start: date
    end: date


class TimelineEntryInDB(TimelineEntryBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True


class ProjectInDB(ProjectBase):
    id: int
    template_id: str
    timeline_entries: List[TimelineEntryInDB] = []
    # We'll expect collaborators as a list of strings and assignments as a dict:
    collaborators: List[str] = []
    assignments: Dict[str, str] = {}
    startDate: date = Field(..., alias="start_date")

    class Config:
        from_attributes = True
        populate_by_name = True


# --- Additional Models for Metrics (Optional) ---
class ProjectMetrics(BaseModel):
    total_members: int
    active_members: int
    team_members: List[EmailStr]
    roles_distribution: Dict[str, int]


class PhaseMetrics(BaseModel):
    total_phases: int
    completed_phases: int
    in_progress_phases: int
    upcoming_phases: int
    completion_percentage: float
    phase_distribution: Dict[str, int]


class ProjectFullMetrics(BaseModel):
    team: ProjectMetrics
    phases: PhaseMetrics
    last_updated: str


# Resolve forward references if needed.
ProjectInDB.update_forward_refs()
TimelineEntryInDB.update_forward_refs()


class TimelineEntryOut(BaseModel):
    id: int
    project_id: int
    section: str
    subtitle: str
    responsible: str
    start: date
    end: date


class ProjectInDB(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    start_date: date
    deadline: date
    template_id: str
    timeline_entries: List[TimelineEntryOut] = []

    # Extract only emails from the ProjectCollaborator relationship
    collaborators: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True
