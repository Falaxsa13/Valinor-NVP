import json
from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.schemas.project_schema import (
    CreateProjectRequest,
    GenerateTimelineRequest,
    ProjectResponse,
    TemplateResponse,
    TemplateSectionResponse,
    TemplateSubtitleResponse,
    TimelineEntryResponse,
)
from openai import OpenAI
from app.core.config import settings
from app.models.project import Project
from app.models.timeline import TimelineEntry
from app.models.user import User
from app.models.associations import project_collaborators
from app.models.template import Template, TemplateSection, TemplateSubtitle


def create_project(request: CreateProjectRequest, db: Session) -> ProjectResponse:
    """Creates a new project in the database, including the AI-generated timeline."""

    # Validate template exists
    template = db.query(Template).filter(Template.id == request.template_id).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Create project entry
    new_project = Project(
        title=request.title,
        description=request.description,
        start_date=request.start_date,
        deadline=request.deadline,
        template_id=request.template_id,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    collaborators = db.query(User).filter(User.email.in_(request.collaborators)).all()

    new_project.collaborators.extend(collaborators)

    # Create timeline entries
    timeline_entries = []

    # For all timeline entries, create a new TimelineEntry object
    for entry in request.timeline:

        # Find the responsible user in the database
        responsible_user = db.query(User).filter(User.email == entry.responsible_email).first()

        # Create a new timeline entry
        timeline_entry = TimelineEntry(
            project_id=new_project.id,
            responsible_id=responsible_user.id if responsible_user else None,
            description=None,
            section=entry.section,
            subtitle=entry.subtitle,
            start=entry.start,
            end=entry.end,
        )

        timeline_entries.append(timeline_entry)

    db.add_all(timeline_entries)
    db.commit()

    for timeline_entry in timeline_entries:
        db.refresh(timeline_entry)

    timeline_response = [
        {
            "id": entry.id,
            "project_id": entry.project_id,
            "section": entry.section,
            "subtitle": entry.subtitle,
            "responsible_email": request.timeline[index].responsible_email,  # Original email
            "description": entry.description,
            "start": str(entry.start),
            "end": str(entry.end),
        }
        for index, entry in enumerate(timeline_entries)
    ]

    return {
        "id": new_project.id,
        "title": new_project.title,
        "description": new_project.description,
        "template": template.name,
        "start_date": str(new_project.start_date),
        "deadline": str(new_project.deadline),
        "collaborators": [user.email for user in collaborators],
        "timeline": timeline_response,
    }


def get_projects_overview(db: Session) -> List[ProjectResponse]:
    """
    Fetch all projects from the database and return them in the new response format.

    Args:
        db (Session): SQLAlchemy database session.

    Returns:
        List[ProjectResponse]: A list of ProjectResponse objects, each containing:
            - id (int): The project ID.
            - title (str): The project title.
            - description (str): The project description.
            - template (str): The name of the template associated with the project.
            - collaborators (List[str]): A list of email addresses of the project's collaborators.
            - start_date (datetime): The start date of the project.
            - deadline (datetime): The deadline of the project.
            - timeline (List[TimelineEntryResponse]): A list of timeline entries associated with the project, each containing:
                - id (int): The timeline entry ID.
                - project_id (int): The ID of the project the timeline entry belongs to.
                - section (str): The section of the timeline entry.
                - subtitle (str): The subtitle of the timeline entry.
                - responsible_email (str): The email of the user responsible for the timeline entry.
                - description (str): The description of the timeline entry.
                - start (datetime): The start date of the timeline entry.
                - end (datetime): The end date of the timeline entry.

    Fetch all projects from the database and return them in the new response format.
    """

    projects = (
        db.query(
            Project.id,
            Project.title,
            Project.description,
            Project.start_date,
            Project.deadline,
            Template.name.label("template_name"),
        )
        .join(Template, Project.template_id == Template.id)
        .all()
    )

    project_list = []

    for proj in projects:
        # Fetch collaborators for the project
        collaborators = (
            db.query(User.email)
            .join(project_collaborators, project_collaborators.c.user_id == User.id)
            .filter(project_collaborators.c.project_id == proj.id)
            .all()
        )

        # Fetch timeline entries for the project
        timeline_entries = (
            db.query(
                TimelineEntry.id,
                TimelineEntry.project_id,
                TimelineEntry.section,
                TimelineEntry.subtitle,
                User.email.label("responsible_email"),
                TimelineEntry.description,
                TimelineEntry.start,
                TimelineEntry.end,
            )
            .outerjoin(User, TimelineEntry.responsible_id == User.id)
            .filter(TimelineEntry.project_id == proj.id)
            .all()
        )

        formatted_timeline = [
            TimelineEntryResponse(
                id=entry.id,
                project_id=entry.project_id,
                section=entry.section,
                subtitle=entry.subtitle,
                responsible_email=entry.responsible_email,
                description=entry.description,
                start=entry.start,
                end=entry.end,
            )
            for entry in timeline_entries
        ]

        project_list.append(
            ProjectResponse(
                id=proj.id,
                title=proj.title,
                description=proj.description,
                template=proj.template_name,
                collaborators=[c.email for c in collaborators],
                start_date=proj.start_date,
                deadline=proj.deadline,
                timeline=formatted_timeline,
            )
        )

    return project_list


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


def get_project_full(project_id: int, db: Session) -> ProjectResponse:

    # Retrieve the project with its template name
    project_data = (
        db.query(
            Project.id,
            Project.title,
            Project.description,
            Project.start_date,
            Project.deadline,
            Template.name.label("template_name"),
        )
        .join(Template, Project.template_id == Template.id)
        .filter(Project.id == project_id)
        .first()
    )

    print("project_data", project_data)

    if not project_data:
        return None

    # Retrieve collaborators' emails
    collaborators = (
        db.query(User.email)
        .join(project_collaborators, project_collaborators.c.user_id == User.id)
        .filter(project_collaborators.c.project_id == project_id)
        .all()
    )

    timeline_entries_data = (
        db.query(
            TimelineEntry.id,
            TimelineEntry.project_id,
            TimelineEntry.section,
            TimelineEntry.subtitle,
            TimelineEntry.description,
            TimelineEntry.start,
            TimelineEntry.end,
            User.email.label("responsible_email"),
        )
        .outerjoin(User, TimelineEntry.responsible_id == User.id)
        .filter(TimelineEntry.project_id == project_id)
        .all()
    )

    # Format timeline entries to match TimelineEntryResponse
    formatted_timeline = [
        TimelineEntryResponse(
            id=entry.id,
            project_id=entry.project_id,
            section=entry.section,
            subtitle=entry.subtitle,
            responsible_email=entry.responsible_email,
            description=entry.description,
            start=entry.start,
            end=entry.end,
        )
        for entry in timeline_entries_data
    ]

    # Assemble the final ProjectResponse using the gathered data
    project_response = ProjectResponse(
        id=project_data.id,
        title=project_data.title,
        description=project_data.description,
        template=project_data.template_name,
        collaborators=[c.email for c in collaborators],
        start_date=project_data.start_date,
        deadline=project_data.deadline,
        timeline=formatted_timeline,
    )

    return project_response


def get_project_metrics(project_id: int, db: Session):
    # Fetch the project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None

    # Fetch timeline entries for the project
    timeline_entries = db.query(TimelineEntry).filter(TimelineEntry.project_id == project_id).all()

    # Calculate phase metrics
    today = date.today()
    total_phases = len(timeline_entries)
    completed_phases = 0
    in_progress_phases = 0
    upcoming_phases = 0

    for entry in timeline_entries:
        if entry.end < today:
            completed_phases += 1
        elif entry.start > today:
            upcoming_phases += 1
        else:
            in_progress_phases += 1

    completion_percentage = int((completed_phases / total_phases) * 100) if total_phases > 0 else 0

    # Team metrics: count the collaborators (assuming all are active)
    team_members = project.collaborators
    total_members = len(team_members)
    active_members = total_members  # For demonstration purposes

    metrics = {
        "team": {
            "total_members": total_members,
            "active_members": active_members,
            "team_members": [{"id": user.id, "email": user.email, "name": user.name} for user in team_members],
            "roles_distribution": {},  # No role info provided, so return an empty dict
        },
        "phases": {
            "total_phases": total_phases,
            "completed_phases": completed_phases,
            "in_progress_phases": in_progress_phases,
            "upcoming_phases": upcoming_phases,
            "completion_percentage": completion_percentage,
            "phase_distribution": {
                "completed": completed_phases,
                "in_progress": in_progress_phases,
                "upcoming": upcoming_phases,
            },
        },
        "last_updated": today.isoformat(),
    }
    return metrics
