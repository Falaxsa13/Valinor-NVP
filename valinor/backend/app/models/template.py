from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Template(Base):
    """Template model representing a project template in the system.

    This class defines the structure and relationships for project templates, which serve
    as blueprints for creating new projects.

    Attributes:
        id (int): Unique identifier for the template
        name (str): Name of the template (required)
        description (str): Optional description of the template
        icon (str): Optional icon identifier or path for the template
        sections (list): List of associated TemplateSection instances
        projects (list): List of Project instances created from this template

    Relationships:
        - One-to-Many with TemplateSection (cascade delete)
        - One-to-Many with Project
    """

    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)

    sections = relationship("TemplateSection", back_populates="template", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="template")


class TemplateSection(Base):
    """
    A class representing a section within a template structure.

    Attributes:
        id (int): The unique identifier for the section.
        template_id (int): Foreign key referencing the parent template.
        title (str): The title/name of the section.
        subtitles (relationship): One-to-many relationship with TemplateSubtitle class.
        template (relationship): Many-to-one relationship with Template class.

    Relations:
        - Parent relationship with Template class
        - Child relationship with TemplateSubtitle class

    Note:
        This class represents a database model using SQLAlchemy ORM.
        The cascade="all, delete-orphan" ensures that all related subtitles are deleted when a section is deleted.
    """

    __tablename__ = "template_sections"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    title = Column(String, nullable=False)

    subtitles = relationship("TemplateSubtitle", back_populates="section", cascade="all, delete-orphan")
    template = relationship("Template", back_populates="sections")


class TemplateSubtitle(Base):
    """A model representing a subtitle within a template section.

    This class defines the structure for template subtitles in the database, where each
    subtitle belongs to a specific template section.

    Attributes:
        id (int): The primary key identifier for the subtitle.
        section_id (int): The foreign key referencing the parent template section.
        subtitle (str): The text content of the subtitle.
        section (TemplateSection): The relationship to the parent template section.
    """

    __tablename__ = "template_subtitles"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("template_sections.id"), nullable=False)
    subtitle = Column(String, nullable=False)

    section = relationship("TemplateSection", back_populates="subtitles")
