from app.db.base import Base
from sqlalchemy import Column, Integer, String, Date, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.models.associations import project_collaborators


# --- Projects Table ---
class Project(Base):
    """
    Represents a project entity in the database.

    Attributes:
        id (int): The unique identifier of the project.
        title (str): The title of the project.
        description (str, optional): A brief description of the project.
        start_date (date): The start date of the project.
        deadline (date): The deadline for the project.

    Relationships:
        template_id (int): The foreign key referencing the template associated with the project.
        template (Template): The template associated with the project.
        timeline_entries (list[TimelineEntry]): The timeline entries associated with the project.
        collaborators (list[User]): The users collaborating on the project.
    """

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    deadline = Column(Date, nullable=False)

    # Relationships
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    template = relationship("Template", back_populates="projects")

    timeline_entries = relationship("TimelineEntry", back_populates="project", cascade="all, delete-orphan")
    collaborators = relationship("User", secondary=project_collaborators, back_populates="projects")
