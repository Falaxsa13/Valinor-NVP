from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.associations import project_collaborators


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)

    projects = relationship("Project", secondary=project_collaborators, back_populates="collaborators")
    timeline_entries = relationship("TimelineEntry", back_populates="responsible_user")
