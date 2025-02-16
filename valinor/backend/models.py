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
