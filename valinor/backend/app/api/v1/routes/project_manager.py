from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.project_service import (
    create_project,
    delete_project_by_id,
    get_projects_overview,
    get_project_full,
    get_project_metrics,
)

from app.services.timeline_service import (
    generate_project_timeline,
)

from app.schemas.project_schema import (
    CreateProjectRequest,
    GenerateTimelineRequest,
    GeneratedTimelineEntryResponse,
    ProjectResponse,
    TemplateResponse,
    TimelineEntryResponse,
)
from app.schemas.metrics_schema import ProjectMetricsResponse

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
async def get_project_status():
    return {"message": "Welcome to the project manager endpoints"}


@router.post("/create-project", response_model=ProjectResponse)
def create_project_endpoint(request: CreateProjectRequest, db: Session = Depends(get_db)):
    """Creates a new project."""
    return create_project(request, db)


@router.get("/get-projects-overview", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    """Retrieve all projects."""
    return get_projects_overview(db)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """
    Retrieve full details for a single project.
    """
    project = get_project_full(project_id, db)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/generate-timeline", response_model=List[GeneratedTimelineEntryResponse])
def generate_timeline_endpoint(request: GenerateTimelineRequest, db: Session = Depends(get_db)):
    """Generates a timeline based on project details and AI assistance."""
    return generate_project_timeline(request, db)


@router.get("/{project_id}/metrics", response_model=ProjectMetricsResponse)
def get_project_metrics_endpoint(project_id: int, db: Session = Depends(get_db)):
    metrics = get_project_metrics(project_id, db)
    if metrics is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return metrics
