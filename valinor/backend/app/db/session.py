# session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# PostgreSQL Database URL
SQLALCHEMY_DATABASE_URL = "postgresql://admin:valinor@localhost:5432/valinor"

# Create database engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
