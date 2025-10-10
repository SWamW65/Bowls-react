import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Для разработки на хосте
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:samlink@localhost:5432/bowls")

# Для Docker-контейнеров
# DATABASE_URL = "postgresql://postgres:samlink@bowls-react_postgres:5432/bowls"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()