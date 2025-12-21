from fastapi import FastAPI
from database import engine
from sqlalchemy import text
from models import Base

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/")
def test_db():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "Database connected successfully!"}
    except Exception as e:
        return {"error": str(e)}
