from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes import pdf_parsing, project_manager, latex_converter, document_edit
from app.db.session import engine
from app.models.base import Base, Project, TimelineEntry

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Middleware settings for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(pdf_parsing.router, prefix="/pdf", tags=["PDF Parsing"])
app.include_router(project_manager.router, prefix="/project", tags=["Project Management"])
app.include_router(latex_converter.router, prefix="/latex", tags=["LaTeX Conversion"])
app.include_router(document_edit.router, prefix="/document", tags=["Document Editing"])

@app.get("/")
def home():
    return {"message": "Welcome to the API"}