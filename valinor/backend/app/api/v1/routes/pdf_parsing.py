from fastapi import APIRouter, UploadFile, File, HTTPException
from io import BytesIO
import PyPDF2

router = APIRouter()
@router.get("/")
async def get_parsing_status():
    return {"message": "Welcome to the parsing endpoints"}

@router.post("/parse")
async def parse_pdf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        pdf_file = BytesIO(contents)
        pdf_reader = PyPDF2.PdfReader(pdf_file)

        text_content = [page.extract_text() for page in pdf_reader.pages]
        full_text = "\n".join(text_content)

        return {
            "filename": file.filename,
            "page_count": len(pdf_reader.pages),
            "content": full_text
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
