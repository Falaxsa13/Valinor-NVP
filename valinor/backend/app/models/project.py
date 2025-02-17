from app.db.base import Base
from sqlalchemy import Column, Integer, String, Date, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.models.associations import project_collaborators


# --- Projects Table ---
class Project(Base):
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
