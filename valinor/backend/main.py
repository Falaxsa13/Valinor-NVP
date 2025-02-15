import json
import datetime
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

import json

# SQLAlchemy imports
from sqlalchemy.orm import Session
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


# Dependency: Get a DB session.
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

    # Convert startDate and deadline strings to date objects.
    try:
        start_date_obj = datetime.datetime.strptime(
            request.startDate, "%Y-%m-%d"
        ).date()
        deadline_obj = datetime.datetime.strptime(request.deadline, "%Y-%m-%d").date()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Date conversion error: {e}")

    # Create the new project.
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


@app.get("/projects")
def read_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return projects


@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}
