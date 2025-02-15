# migrate_templates.py

import json
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Project, TemplateModel, TemplateSectionModel, TemplateSubtitleModel


def migrate_templates():
    db: Session = SessionLocal()
    try:
        projects = db.query(Project).all()
        for project in projects:
            # Retrieve and parse the template JSON from the old field.
            template_data = project.template
            if isinstance(template_data, str):
                template_data = json.loads(template_data)

            # Get the template id from the JSON data.
            template_id = template_data.get("id")
            if not template_id:
                print(f"Project {project.id} has no template id, skipping.")
                continue

            # Check if this template already exists in the new table.
            template_obj = (
                db.query(TemplateModel).filter(TemplateModel.id == template_id).first()
            )
            if not template_obj:
                # Create a new TemplateModel record.
                template_obj = TemplateModel(
                    id=template_id,
                    name=template_data.get("name"),
                    description=template_data.get("description"),
                    icon=template_data.get("icon"),
                )
                db.add(template_obj)
                db.commit()
                db.refresh(template_obj)
                print(f"Inserted Template: {template_obj.id}")

                # Migrate sections.
                structure = template_data.get("structure", {})
                sections = structure.get("sections", [])
                for sec in sections:
                    section_obj = TemplateSectionModel(
                        template_id=template_obj.id,
                        title=sec.get("title"),
                    )
                    db.add(section_obj)
                    db.commit()
                    db.refresh(section_obj)
                    print(f"  Inserted Section: {section_obj.title}")

                    # Migrate subtitles for this section.
                    subtitles = sec.get("subtitles", [])
                    for subtitle in subtitles:
                        subtitle_obj = TemplateSubtitleModel(
                            section_id=section_obj.id,
                            subtitle=subtitle,
                        )
                        db.add(subtitle_obj)
                    db.commit()
            else:
                print(f"Template {template_id} already exists.")

            # Update the project record: set the template_id and optionally clear the old template field.
            project.template_id = template_obj.id
            project.template = (
                None  # Optionally clear the JSON field if no longer needed.
            )
            db.commit()
            print(f"Updated Project {project.id} with template_id {template_obj.id}")

        print("Migration completed successfully.")
    except Exception as e:
        db.rollback()
        print("Error during migration:", e)
    finally:
        db.close()


if __name__ == "__main__":
    migrate_templates()
