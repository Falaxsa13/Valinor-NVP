import json
import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.schemas.project_schema import RoadmapRequest
from openai import OpenAI
from app.core.config import settings
from app.models.project import Project
from app.models.timeline import TimelineEntry

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_project_timeline(request: RoadmapRequest):
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


def create_project(request: RoadmapRequest, db: Session):
    """Creates a new project and generates a timeline."""

    try:
        start_date_obj = datetime.datetime.strptime(request.startDate, "%Y-%m-%d").date()
        deadline_obj = datetime.datetime.strptime(request.deadline, "%Y-%m-%d").date()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Date conversion error: {e}")

    # Generate the timeline
    timeline_data = generate_project_timeline(request)

    # Save project
    new_project = Project(
        title=request.title,
        description=request.description,
        template=request.template,
        collaborators=request.collaborators,
        assignments=request.assignments,
        start_date=start_date_obj,
        deadline=deadline_obj,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Save timeline entries
    for entry in timeline_data:
        try:
            entry_start = datetime.datetime.strptime(entry.get("start"), "%Y-%m-%d").date()
            entry_end = datetime.datetime.strptime(entry.get("end"), "%Y-%m-%d").date()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing timeline dates: {e}")

        timeline_entry = TimelineEntry(
            project_id=new_project.id,
            section=entry.get("section"),
            subtitle=entry.get("subtitle"),
            responsible=entry.get("responsible"),
            start=entry_start,
            end=entry_end,
        )
        db.add(timeline_entry)

    db.commit()

    return {
        "message": "Project saved",
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
