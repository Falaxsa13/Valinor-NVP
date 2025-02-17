from pydantic import BaseModel, Field
from datetime import date
from typing import Dict, List, Optional


# Pydantic model for generating a project timeline.
class CreateProjectRequest(BaseModel):
    title: str
    description: Optional[str] = None
    template_id: int
    collaborators: List[str] = []
    start_date: date
    deadline: date
    assignments: Dict[str, str] = Field(default_factory=dict)

    class Config:
        from_attributes = True


class TimelineEntryResponse(BaseModel):
    id: int
    section: str
    subtitle: str | None
    responsible: str | None
    start: date
    end: date

    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    template_id: int
    collaborators: List[str]
    start_date: date
    deadline: date
    assignments: Dict[str, str]

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


class GenerateTimelineRequest(BaseModel):
    project_title: str
    project_description: Optional[str] = None
    template_id: int
    collaborators: List[str] = []
    start_date: date
    deadline: date
    assignments: Dict[str, str] = {}

    class Config:
        from_attributes = True


class TimelineEntryResponse(BaseModel):
    section: str
    subtitle: Optional[str] = None
    responsible: Optional[str] = None
    start: date
    end: date

    class Config:
        from_attributes = True
