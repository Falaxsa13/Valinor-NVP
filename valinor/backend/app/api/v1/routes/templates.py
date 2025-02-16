from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.project_service import get_all_templates
from app.schemas.project_schema import RoadmapRequest, ProjectResponse, TemplateResponse

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/get-all-templates", response_model=list[TemplateResponse])
def get_templates(db: Session = Depends(get_db)):
    """Fetch all available templates."""
    return get_all_templates(db)
