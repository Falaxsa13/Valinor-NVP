import json
import datetime
from pprint import pformat, pprint
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from datetime import date

from models import (
    PhaseMetrics,
    Project,
    ProjectAssignment,
    ProjectCollaborator,
    ProjectFullMetrics,
    ProjectInDB,
    ProjectMetrics,
    TimelineEntry,
    TimelineEntryOut,
)

import json

# SQLAlchemy imports
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal, engine, Base
from models import Project, TimelineEntry

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI client.
import openai
from openai import OpenAI

client = OpenAI(
    api_key="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"
)


# Pydantic model for LaTeX conversion.
class TextRequest(BaseModel):
    content: str


@app.post("/generate-latex")
def generate_latex(request: TextRequest):

    prompt = f"""
    Convert the following text into LaTeX **ONLY**. 
    Do not include explanations or additional comments. 
    Return only valid LaTeX code that can be compiled directly.

    Text: {request.content}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an AI that strictly converts text into LaTeX without explanations.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    return {"latex": response.choices[0].message.content.strip()}


# Pydantic model for generating a project timeline.
class RoadmapRequest(BaseModel):
    title: str
    description: str = ""
    template: dict
    collaborators: list[str] = []
    startDate: str  # Format: "YYYY-MM-DD"
    deadline: str  # Format: "YYYY-MM-DD"
    assignments: dict = Field(default_factory=dict)


@app.post("/generate-roadmap")
def generate_roadmap(request: RoadmapRequest):
    # Convert the template and assignments to JSON strings for clarity in the prompt.
    template_json = json.dumps(request.template)
    assignments_json = json.dumps(request.assignments)

    # Build the prompt with explicit constraints and instructions.
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
            {
                "role": "system",
                "content": "You are an expert project manager who creates detailed project timelines.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    # Extract and clean the response.
    result_text = response.choices[0].message.content.strip()
    print("Raw AI output:", result_text)

    # Remove Markdown code fences if present.
    if result_text.startswith("```json"):
        result_text = result_text[len("```json") :].strip()
    elif result_text.startswith("```"):
        result_text = result_text[len("```") :].strip()
    if result_text.endswith("```"):
        result_text = result_text[:-3].strip()

    # Attempt to parse the JSON response.
    try:
        result_json = json.loads(result_text)
    except Exception as e:
        return {
            "error": "Failed to parse JSON response",
            "raw_response": result_text,
            "exception": str(e),
        }

    # Wrap the array in an object if necessary.
    if isinstance(result_json, list):
        return {"timeline": result_json}

    return result_json


# --------------------------------------------
# Dependency to get DB session.
# --------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# New endpoint: Create a project in the database.
@app.post("/create-project")
def create_project(request: RoadmapRequest, db: Session = Depends(get_db)):
    # Generate timeline using the same prompt logic.
    # Convert the template and assignments to JSON strings for clarity in the prompt.
    template_json = json.dumps(request.template)
    assignments_json = json.dumps(request.assignments)

    # Build the prompt with explicit constraints and instructions.
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
            {
                "role": "system",
                "content": "You are an expert project manager who creates detailed project timelines.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    # Extract and clean the response.
    result_text = response.choices[0].message.content.strip()

    if result_text.startswith("```json"):
        result_text = result_text[len("```json") :].strip()
    if result_text.endswith("```"):
        result_text = result_text[:-3].strip()
    try:
        timeline_data = json.loads(result_text)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse timeline: {e}. Raw response: {result_text}",
        )
    if not isinstance(timeline_data, list):
        raise HTTPException(status_code=400, detail="Unexpected timeline format.")

    # Convert dates
    try:
        start_date_obj = datetime.datetime.strptime(
            request.startDate, "%Y-%m-%d"
        ).date()
        deadline_obj = datetime.datetime.strptime(request.deadline, "%Y-%m-%d").date()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Date conversion error: {e}")

    # Create a new project.
    # Note: Since our Project model now uses relationships for collaborators and assignments,
    # we must create those related objects.
    new_project = Project(
        title=request.title,
        description=request.description,
        start_date=start_date_obj,
        deadline=deadline_obj,
        template_id=request.template.get("id"),  # Store only the template ID
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Migrate collaborators from the request into ProjectCollaborator records.
    for email in request.collaborators:
        collaborator = ProjectCollaborator(project_id=new_project.id, email=email)
        db.add(collaborator)
    db.commit()

    # Migrate assignments from the request into ProjectAssignment records.
    # The request.assignments is a dict mapping section names to assigned email.
    for section, assigned_email in request.assignments.items():
        assignment = ProjectAssignment(
            project_id=new_project.id, section=section, assigned_email=assigned_email
        )
        db.add(assignment)
    db.commit()

    # Now, add timeline entries.
    for entry in timeline_data:
        try:
            entry_start = datetime.datetime.strptime(
                entry.get("start"), "%Y-%m-%d"
            ).date()
            entry_end = datetime.datetime.strptime(entry.get("end"), "%Y-%m-%d").date()
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Error parsing timeline dates: {e}"
            )
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


# --------------------------------------------
# Endpoint: Read all projects.
# --------------------------------------------
@app.get("/projects", response_model=List[ProjectInDB])
def read_projects(db: Session = Depends(get_db)):
    projects = (
        db.query(Project)
        .options(
            joinedload(Project.timeline_entries),
            joinedload(Project.collaborators),  # ✅ Load collaborators correctly
        )
        .all()
    )

    # Convert `Project` objects into dictionaries and format collaborators
    return [
        ProjectInDB(
            id=project.id,
            title=project.title,
            description=project.description,
            start_date=project.start_date,
            deadline=project.deadline,
            template_id=project.template_id,
            timeline_entries=[
                TimelineEntryOut(
                    id=entry.id,
                    project_id=entry.project_id,
                    section=entry.section,
                    subtitle=entry.subtitle or "",
                    responsible=entry.responsible or "",
                    start=entry.start,
                    end=entry.end,
                )
                for entry in project.timeline_entries
            ],
            collaborators=[
                collab.email for collab in project.collaborators
            ],  # ✅ Extract only emails
        )
        for project in projects
    ]


# --------------------------------------------
# Endpoint: Delete a project.
# --------------------------------------------
@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}


# --------------------------------------------
# Endpoint: Read one project.
# --------------------------------------------
@app.get("/projects/{project_id}", response_model=ProjectInDB)
def read_project(project_id: int, db: Session = Depends(get_db)):
    project = (
        db.query(Project)
        .options(joinedload(Project.timeline_entries))
        .filter(Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# --------------------------------------------
# Endpoint: Get project team metrics.
# --------------------------------------------
@app.get("/projects/{project_id}/team", response_model=ProjectMetrics)
def get_project_team(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Extract emails from the related collaborators.
    collaborators = [collab.email for collab in project.collaborators]
    return ProjectMetrics(
        total_members=len(collaborators),
        active_members=len(
            collaborators
        ),  # All considered active if no status is stored.
        team_members=collaborators,
        roles_distribution={},  # Roles not implemented.
    )


# --------------------------------------------
# Endpoint: Get project phase metrics.
# --------------------------------------------
@app.get("/projects/{project_id}/phases", response_model=PhaseMetrics)
def get_project_phases(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    timeline_entries = (
        db.query(TimelineEntry).filter(TimelineEntry.project_id == project_id).all()
    )
    total_phases = len(timeline_entries)
    current_date = date.today()
    completed_phases = sum(1 for entry in timeline_entries if current_date > entry.end)
    in_progress_phases = sum(
        1 for entry in timeline_entries if entry.start <= current_date <= entry.end
    )
    upcoming_phases = sum(1 for entry in timeline_entries if current_date < entry.start)
    completion_percentage = (
        (completed_phases / total_phases * 100) if total_phases > 0 else 0
    )
    return PhaseMetrics(
        total_phases=total_phases,
        completed_phases=completed_phases,
        in_progress_phases=in_progress_phases,
        upcoming_phases=upcoming_phases,
        completion_percentage=round(completion_percentage, 2),
        phase_distribution={
            "completed": completed_phases,
            "in_progress": in_progress_phases,
            "upcoming": upcoming_phases,
        },
    )


def get_roles_distribution(collaborators: List[Dict]) -> Dict:
    roles = {}
    for member in collaborators:
        role = member.get("role", "Unassigned")
        roles[role] = roles.get(role, 0) + 1
    return roles


# --------------------------------------------
# Endpoint: Get full project metrics.
# --------------------------------------------
@app.get("/projects/{project_id}/metrics", response_model=ProjectFullMetrics)
def get_project_metrics(project_id: int, db: Session = Depends(get_db)):
    team_data = get_project_team(project_id, db)
    phases_data = get_project_phases(project_id, db)
    return ProjectFullMetrics(
        team=team_data, phases=phases_data, last_updated=date.today().isoformat()
    )
