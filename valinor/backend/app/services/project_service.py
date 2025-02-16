import json
import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.schemas.project_schema import RoadmapRequest
from openai import OpenAI
from app.core.config import settings
from app.models.project import Project
from app.models.timeline import TimelineEntry
from app.models.user import User
from app.models.associations import project_collaborators
from app.models.template import Template, TemplateSubtitle

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_project_timeline(request: RoadmapRequest) -> list:
    """Generates a detailed timeline using OpenAI based on project details."""

    template_json = json.dumps(request.template)
    assignments_json = json.dumps(request.assignments)

    prompt = (
        f"Generate a detailed project timeline for the project titled '{request.title}'.\n"
        f"Description: {request.description}\n"
        f"Template: {template_json}\n"
        f"Collaborators: {', '.join(request.collaborators)}\n"
        f"Start Date: {request.startDate}\n"
        f"Deadline: {request.deadline}\n"
        f"Assignments: {assignments_json}\n\n"
        f"Constraints:\n"
        f"- All timeline dates must be between the project start date ({request.startDate}) and the deadline ({request.deadline}).\n"
        f"- Ensure that for any given collaborator, tasks do not overlap.\n"
        f"- Provide detailed timeline entries for every section and every subtitle listed in the template structure.\n\n"
        f"Output Requirements:\n"
        f"Return a valid JSON array where each element is an object with the following keys:\n"
        f"  - 'section': The section title.\n"
        f"  - 'subtitle': The subtitle title (or null if none).\n"
        f"  - 'responsible': The assigned collaborator's email for that section/subtitle, if any (or null).\n"
        f"  - 'start': The start date in YYYY-MM-DD format.\n"
        f"  - 'end': The end date in YYYY-MM-DD format.\n\n"
        f"Ensure that the timeline is as detailed as possible, providing entries for every section and subtitle, and that all dates are realistic and sequential so that the entire project is completed by the deadline.\n"
        f"Output only the JSON array with no additional text."
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert project manager who creates detailed project timelines."},
            {"role": "user", "content": prompt},
        ],
    )

    result_text = response.choices[0].message.content.strip()

    if result_text.startswith("```json"):
        result_text = result_text[len("```json") :].strip()
    if result_text.endswith("```"):
        result_text = result_text[:-3].strip()

    try:
        timeline_data = json.loads(result_text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse timeline: {e}. Raw response: {result_text}")

    if not isinstance(timeline_data, list):
        raise HTTPException(status_code=400, detail="Unexpected timeline format.")

    return timeline_data


def create_project(request: RoadmapRequest, db: Session) -> dict:
    """Creates a new project and generates a timeline."""

    try:
        start_date_obj = datetime.datetime.strptime(request.startDate, "%Y-%m-%d").date()
        deadline_obj = datetime.datetime.strptime(request.deadline, "%Y-%m-%d").date()

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Date conversion error: {e}")

    # Ensure the template exists
    template = db.query(Template).filter(Template.id == request.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail=f"Template with ID {request.template_id} not found.")

    # Save project
    new_project = Project(
        title=request.title,
        description=request.description,
        start_date=start_date_obj,
        deadline=deadline_obj,
        template_id=template.id,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Add collaborators
    for email in request.collaborators:
        user = db.query(User).filter(User.email == email).first()
        if user:
            db.execute(project_collaborators.insert().values(user_id=user.id, project_id=new_project.id))
        else:
            raise HTTPException(status_code=404, detail=f"User {email} not found.")

    db.commit()

    # Generate timeline
    timeline_data = generate_project_timeline(request, db)

    # Save timeline entries
    for entry in timeline_data:
        try:
            entry_start = datetime.datetime.strptime(entry.get("start"), "%Y-%m-%d").date()
            entry_end = datetime.datetime.strptime(entry.get("end"), "%Y-%m-%d").date()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing timeline dates: {e}")

        # Find subtitle ID
        subtitle = (
            db.query(TemplateSubtitle)
            .filter(
                TemplateSubtitle.subtitle == entry.get("subtitle"),
                TemplateSubtitle.section.has(template_id=template.id),
            )
            .first()
        )

        if not subtitle:
            raise HTTPException(
                status_code=404, detail=f"Subtitle '{entry.get('subtitle')}' not found in template {template.id}."
            )

        # Find responsible user
        responsible_user = db.query(User).filter(User.email == entry.get("responsible")).first()
        responsible_id = responsible_user.id if responsible_user else None

        timeline_entry = TimelineEntry(
            project_id=new_project.id,
            subtitle_id=subtitle.id,
            responsible_id=responsible_id,
            description=entry.get("description"),
            start=entry_start,
            end=entry_end,
        )
        db.add(timeline_entry)

    db.commit()

    return {
        "message": "Project created successfully",
        "project_id": new_project.id,
        "timeline": timeline_data,
    }


def get_all_projects(db: Session):
    """Fetch all projects from the database."""
    return db.query(Project).all()


def delete_project_by_id(project_id: int, db: Session):
    """Deletes a project and its associated timeline entries."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Delete all timeline entries related to this project
    db.query(TimelineEntry).filter(TimelineEntry.project_id == project_id).delete()

    db.delete(project)
    db.commit()

    return {"message": "Project and its timeline deleted successfully"}


def get_all_templates(db: Session):
    """Retrieves all templates from the database."""
    return db.query(Template).all()
