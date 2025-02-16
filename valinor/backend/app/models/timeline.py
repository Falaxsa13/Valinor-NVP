from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from app.db.base import Base


# --- Timeline Entry Model ---
class TimelineEntry(Base):
    __tablename__ = "timeline_entries"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    subtitle_id = Column(Integer, ForeignKey("template_subtitles.id"), nullable=False)
    responsible_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    description = Column(String, nullable=True)
    start = Column(Date, nullable=False)
    end = Column(Date, nullable=False)

    project = relationship("Project", back_populates="timeline_entries")
    responsible_user = relationship("User", back_populates="timeline_entries")
    subtitle = relationship("TemplateSubtitle", back_populates="timeline_entries")
