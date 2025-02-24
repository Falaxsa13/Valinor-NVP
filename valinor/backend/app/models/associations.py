# associations.py
from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.base import Base

# Many-to-Many Relationship between Users and Projects
project_collaborators = Table(
    "project_collaborators",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
)