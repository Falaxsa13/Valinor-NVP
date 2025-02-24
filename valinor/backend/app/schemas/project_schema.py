from pydantic import BaseModel, Field
from datetime import date
from typing import Dict, List, Optional


# =======================================
# Pydantic Models (API Request/Response)
# =======================================


# =======================================
# === Timeline Entry Pydantic Models ===
# =======================================
class GenerateTimelineRequest(BaseModel):
    project_title: str
    project_description: Optional[str] = None
    template_id: int
    collaborators: List[str] = []
    start_date: date
    deadline: date
    section_assignments: Dict[str, str] = {}

    class Config:
        from_attributes = True


# Only used for generating a timeline entry (Not for storing in the database).
class GeneratedTimelineEntryResponse(BaseModel):
    section: str
    subtitle: Optional[str] = None
    responsible_email: Optional[str] = None
    start: date
    end: date


class TimelineEntryResponse(BaseModel):
    id: int
    project_id: int
    section: str
    subtitle: Optional[str]
    responsible_email: Optional[str]
    description: Optional[str]
    start: date
    end: date

    class Config:
        from_attributes = True


# =======================================
# =======================================


# Pydantic model for generating a project timeline.
class CreateProjectRequest(BaseModel):
    title: str
    description: Optional[str] = None
    template_id: int
    collaborators: List[str] = []
    start_date: date
    deadline: date
    assignments: Dict[str, str] = Field(default_factory=dict)
    timeline: List[GeneratedTimelineEntryResponse]

    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    template: str
    template_id: int
    collaborators: List[str]
    start_date: date
    deadline: date
    timeline: List[TimelineEntryResponse]

    class Config:
        from_attributes = True


class TemplateSubtitleResponse(BaseModel):
    id: int
    subtitle: str


class TemplateSectionResponse(BaseModel):
    id: int
    title: str
    subtitles: List[TemplateSubtitleResponse]


class TemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    sections: List[TemplateSectionResponse]

    class Config:
        from_attributes = True
