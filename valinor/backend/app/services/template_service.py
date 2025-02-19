import json
import datetime
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.schemas.project_schema import (
    CreateProjectRequest,
    GenerateTimelineRequest,
    ProjectResponse,
    TimelineEntryResponse,
)
from openai import OpenAI
from app.core.config import settings
from app.models.project import Project
from app.models.timeline import TimelineEntry
from app.models.user import User
from app.models.associations import project_collaborators
from app.models.template import Template, TemplateSection, TemplateSubtitle


def get_all_templates(db: Session):
    """Retrieves all templates from the database."""
    return db.query(Template).all()


def get_template_by_id(template_id: int, db: Session):
    """Retrieves a template by its ID."""
    return db.query(Template).filter(Template.id == template_id).first()
