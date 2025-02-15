from sqlalchemy import Column, Integer, String, Date, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    template = Column(JSON, nullable=False)
    collaborators = Column(JSON, nullable=False)
    assignments = Column(JSON, nullable=False)
    start_date = Column(Date, nullable=False)
    deadline = Column(Date, nullable=False)

    timeline_entries = relationship(
        "TimelineEntry", back_populates="project", cascade="all, delete-orphan"
    )


class TimelineEntry(Base):
    __tablename__ = "timeline_entries"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    section = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    responsible = Column(String, nullable=True)
    start = Column(Date, nullable=False)
    end = Column(Date, nullable=False)

    project = relationship("Project", back_populates="timeline_entries")
