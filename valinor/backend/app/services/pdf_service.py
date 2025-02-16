from io import BytesIO
import uuid
import PyPDF2
from openai import OpenAI

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

def generate_template(raw_text: str, file_name: str):
    """
    Generates a structured template object from raw text using OpenAI.

    Args:
        raw_text (str): The extracted text content from the PDF.
        file_name (str): The name of the uploaded file.

    Returns:
        dict: A structured template object that matches the given interface.
    """
    try:
        client = OpenAI()  # Use synchronous OpenAI client

        prompt = f"""
        Analyze the following document text and generate a structured template object.

        The template should follow this JSON structure:
        {{
          "id": "uuid",
          "name": "string",
          "description": "string",
          "icon": null,  # (Frontend should set the icon)
          "structure": {{
            "sections": [
              {{
                "title": "string",
                "subtitles": ["string", "string"]
              }}
            ]
          }}
        }}

        Here is the document content:
        {raw_text}

        Please return a well-structured JSON object.
        """
        print("Generating template...")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an AI that converts raw text into structured templates."},
                {"role": "user", "content": prompt}
            ]
        )
        print("Template generated")
        structured_data = response.choices[0].message.content

        # Construct the Template object
        template = {
            "id": str(uuid.uuid4()),  # Generate a unique ID
            "name": file_name,  # Use the file name for reference
            "description": f"Auto-generated template from {file_name}",
            "icon": None,  # The frontend should set the React icon
            "structure": structured_data  # AI-generated structure
        }

        return template

    except Exception as e:
        raise ValueError(f"Failed to generate template: {str(e)}")

