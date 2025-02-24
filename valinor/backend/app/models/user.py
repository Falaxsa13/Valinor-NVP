from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.associations import project_collaborators


class User(Base):
    """A User class representing a user in the system.

    This class defines the User model with its attributes and relationships using SQLAlchemy ORM.

    Attributes:
        id (int): Primary key identifier for the user
        email (str): Unique email address of the user
        name (str): Name of the user
        projects (List[Project]): List of projects the user collaborates on, using many-to-many relationship
        timeline_entries (List[TimelineEntry]): List of timeline entries associated with the user

    Table name: users

    Relationships:
        - projects: Many-to-many relationship with Project model through project_collaborators table
        - timeline_entries: One-to-many relationship with TimelineEntry model
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)

    projects = relationship("Project", secondary=project_collaborators, back_populates="collaborators")
    timeline_entries = relationship("TimelineEntry", back_populates="responsible_user")
