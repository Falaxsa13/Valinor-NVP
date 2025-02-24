from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from app.db.base import Base


# --- Timeline Entry Model ---
class TimelineEntry(Base):
    """
    Represents an entry in the project timeline.

    Attributes:
        id (int): The unique identifier for the timeline entry.
        project_id (int): The ID of the project this entry is associated with.
        responsible_id (int, optional): The ID of the user responsible for this entry.
        description (str, optional): A description of the timeline entry.
        section (str): The section of the project this entry belongs to.
        subtitle (str, optional): A subtitle for the timeline entry.
        start (date): The start date of the timeline entry.
        end (date): The end date of the timeline entry.
        project (Project): The project this entry is associated with.
        responsible_user (User): The user responsible for this entry.
    """

    __tablename__ = "timeline_entries"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    responsible_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    description = Column(String, nullable=True)
    section = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    start = Column(Date, nullable=False)
    end = Column(Date, nullable=False)

    project = relationship("Project", back_populates="timeline_entries")
    responsible_user = relationship("User", back_populates="timeline_entries")
