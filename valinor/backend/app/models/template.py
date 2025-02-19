from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)

    sections = relationship("TemplateSection", back_populates="template", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="template")


class TemplateSection(Base):
    __tablename__ = "template_sections"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    title = Column(String, nullable=False)

    subtitles = relationship("TemplateSubtitle", back_populates="section", cascade="all, delete-orphan")
    template = relationship("Template", back_populates="sections")


class TemplateSubtitle(Base):
    __tablename__ = "template_subtitles"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("template_sections.id"), nullable=False)
    subtitle = Column(String, nullable=False)

    section = relationship("TemplateSection", back_populates="subtitles")
