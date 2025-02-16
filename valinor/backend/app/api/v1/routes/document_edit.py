from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_document_status():
    return {"message": "Document editing service is running"}
