from io import BytesIO
import uuid
import PyPDF2
from openai import OpenAI
import json
from app.models.template import Template, TemplateSection, TemplateSubtitle
from app.db.session import SessionLocal

def parse_pdf(contents: bytes, filename: str):
    """
    Parses a PDF file from byte contents and extracts text.

    Args:
        contents (bytes): The binary content of the uploaded PDF.

    Returns:
        dict: A dictionary containing filename, page count, and extracted text.
    """
    try:
        pdf_file = BytesIO(contents)
        pdf_reader = PyPDF2.PdfReader(pdf_file)

        text_content = [page.extract_text() for page in pdf_reader.pages]
        full_text = "\n".join(filter(None, text_content))  # Remove None values

        return {
            "filename": filename,
            "page_count": len(pdf_reader.pages),
            "content": full_text
        }
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")

def generate_template_data(raw_text: str, file_name: str) -> dict:
    """
    Generates template data structure using OpenAI.
    
    Args:
        raw_text (str): The extracted text content from the PDF.
        file_name (str): The name of the uploaded file.
        
    Returns:
        dict: Structured template data ready for DB insertion
    """
    try:
        client = OpenAI()

        prompt = f"""
        Analyze the following document text and generate a structured template object.
        Create a logical structure with sections and subtitles based on the document content.
        
        Return the response as a valid JSON object with this exact structure:
        {{
          "name": "string",
          "description": "string",
          "sections": [
            {{
              "title": "string",
              "subtitles": ["string", "string"]
            }}
          ]
        }}

        Rules:
        - Each section should have a clear title
        - Subtitles should be an array of strings
        - Keep section and subtitle names concise but descriptive
        - Extract 2-5 sections from the content
        - Each section should have 2-4 subtitles

        Document content:
        {raw_text}
        """

        print("Generating template data...")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an AI that converts documents into structured templates with sections and subtitles."},
                {"role": "user", "content": prompt}
            ]
        )
        print("Template data generated")
        
        # Parse and validate the JSON response
        structured_data = json.loads(response.choices[0].message.content)
        
        # Ensure we have valid defaults if AI doesn't provide them
        template_data = {
            "name": structured_data.get("name", file_name),
            "description": structured_data.get("description", f"Auto-generated template from {file_name}"),
            "icon": None,
            "sections": structured_data["sections"]
        }
        
        return template_data

    except Exception as e:
        raise ValueError(f"Failed to generate template data: {str(e)}")

def create_template_in_db(template_data: dict) -> Template:
    """
    Creates a new template in the database from the generated data.
    
    Args:
        template_data (dict): The structured template data from generate_template_data
        
    Returns:
        Template: The created Template object with all relationships
    """
    db = SessionLocal()
    try:
        print("Creating template in database...")
        # Create the Template object
        template = Template(
            name=template_data["name"],
            description=template_data["description"],
            icon=template_data["icon"]
        )
        
        # Create TemplateSection objects with their TemplateSubtitle objects
        for section_data in template_data["sections"]:
            section = TemplateSection(
                title=section_data["title"],
                template=template
            )
            
            # Create TemplateSubtitle objects for each subtitle
            for subtitle_text in section_data["subtitles"]:
                subtitle = TemplateSubtitle(
                    subtitle=subtitle_text,
                    section=section
                )
                section.subtitles.append(subtitle)
            
            template.sections.append(section)

        # Add and commit to database
        db.add(template)
        db.commit()
        db.refresh(template)
        print("Template created in database")
        return template
        
    except Exception as e:
        db.rollback()
        raise ValueError(f"Failed to create template in database: {str(e)}")
    finally:
        db.close()

def generate_template(raw_text: str, file_name: str) -> Template:
    """
    Main function that coordinates template generation and database creation.
    
    Args:
        raw_text (str): The extracted text content from the PDF.
        file_name (str): The name of the uploaded file.
        
    Returns:
        Template: The created Template object with all relationships
    """
    print("Generating template...")
    # First generate the template data using AI
    template_data = generate_template_data(raw_text, file_name)
    
    # Then create it in the database
    created_template = create_template_in_db(template_data)
    print(f"The following template was created: {created_template}")
    return created_template

