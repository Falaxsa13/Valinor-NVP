from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.project_service import (
    create_project,
    delete_project_by_id,
    get_all_projects,
)
from app.schemas.project_schema import RoadmapRequest, ProjectResponse

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
def create_project_endpoint(request: RoadmapRequest, db: Session = Depends(get_db)):
    return create_project(request, db)


@router.get("/get-all-projects", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    """Retrieve all projects."""
    return get_all_projects(db)


@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project by ID."""
    return delete_project_by_id(project_id, db)
