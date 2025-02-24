from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.template_service import get_all_templates, get_template_by_id
from app.schemas.project_schema import ProjectResponse, TemplateResponse

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


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(template_id: int, db: Session = Depends(get_db)):
    """Fetch a template by ID."""
    template = get_template_by_id(template_id, db)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template
