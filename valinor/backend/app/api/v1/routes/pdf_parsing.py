from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_service import parse_pdf, generate_template

router = APIRouter()

@router.get("/")
async def get_parsing_status():
    return {"message": "Welcome to the parsing endpoints"}

@router.post("/parse")
async def parse_pdf_endpoint(file: UploadFile = File(...)):
    """
    API endpoint to parse an uploaded PDF.
    Args:
        file (UploadFile): The uploaded PDF file.
    Returns:
        dict: Parsed PDF information (filename, page count, extracted text).
    """
    try:
        print("Starting PDF parsing")
        print(file)
        contents = await file.read()
        parsed_data = parse_pdf(contents, file.filename)  # Calls service function

        template_object = generate_template(parsed_data["content"], file.filename)

        return {
            "data": template_object
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
