from pydantic import BaseModel, Field
from datetime import date
from typing import Dict, List


# Pydantic model for generating a project timeline.
class RoadmapRequest(BaseModel):
    title: str
    description: str = ""
    template: dict
    collaborators: list[str] = []
    startDate: str  # Format: "YYYY-MM-DD"
    deadline: str  # Format: "YYYY-MM-DD"
    assignments: dict = Field(default_factory=dict)

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
    description: str | None
    template: Dict
    collaborators: List[str]
    assignments: Dict
    start_date: date
    deadline: date
    timeline_entries: List[TimelineEntryResponse] = []

    class Config:
        from_attributes = True
