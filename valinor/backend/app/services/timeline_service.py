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

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_project_timeline(request: GenerateTimelineRequest, db: Session):
    """Generates a detailed timeline using OpenAI based on project details."""

    template = db.query(Template).filter(Template.id == request.template_id).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Convert sections & subtitles into JSON format
    template_structure = {
        "sections": [
            {
                "title": section.title,
                "subtitles": [subtitle.subtitle for subtitle in section.subtitles],
            }
            for section in template.sections
        ]
    }

    # Convert assignments
    assignments_json = json.dumps(request.section_assignments)

    prompt = (
        f"Generate a detailed project timeline for the project titled '{request.project_title}'.\n"
        f"Description: {request.project_description}\n"
        f"Template Structure: {json.dumps(template_structure)}\n"
        f"Collaborators: {', '.join(request.collaborators)}\n"
        f"Start Date: {request.start_date}\n"
        f"Deadline: {request.deadline}\n"
        f"Assignments: {assignments_json}\n\n"
        f"Constraints:\n"
        f"- All timeline dates must be between the project start date ({request.start_date}) and the deadline ({request.deadline}).\n"
        f"- Ensure that for any given collaborator, tasks do not overlap.\n"
        f"- Provide detailed timeline entries for every section and every subtitle listed in the template structure.\n\n"
        f"Output Requirements:\n"
        f"Return a valid JSON array where each element is an object with the following keys:\n"
        f"  - 'section': The section title.\n"
        f"  - 'subtitle': The subtitle title (or null if none).\n"
        f"  - 'responsible_email': The assigned collaborator's email for that section/subtitle, if any (or null).\n"
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
