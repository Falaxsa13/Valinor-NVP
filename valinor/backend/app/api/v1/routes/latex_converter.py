from fastapi import APIRouter
from pydantic import BaseModel
from app.services.latex_service import generate_latex_from_text

router = APIRouter()

class TextRequest(BaseModel):
    content: str

@router.get("/")
async def get_latex_status():
    return {"message": "Welcome to the LaTeX conversion endpoints"}

@router.post("/generate")
async def generate_latex(request: TextRequest):
    """API route to convert text to LaTeX."""
    latex_code = generate_latex_from_text(request.content)
    return {"latex": latex_code}
