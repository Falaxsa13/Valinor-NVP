from pydantic import BaseModel
from typing import List, Dict, Any


class TeamMetrics(BaseModel):
    total_members: int
    active_members: int
    team_members: List[Dict[str, Any]]
    roles_distribution: Dict[str, int]


class PhaseDistribution(BaseModel):
    completed: int
    in_progress: int
    upcoming: int


class PhasesMetrics(BaseModel):
    total_phases: int
    completed_phases: int
    in_progress_phases: int
    upcoming_phases: int
    completion_percentage: int
    phase_distribution: PhaseDistribution


class ProjectMetricsResponse(BaseModel):
    team: TeamMetrics
    phases: PhasesMetrics
    last_updated: str

    class Config:
        from_attributes = True
