from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from database import engine
from sqlalchemy import text
from models import Base
from routes import auth, protected

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI()

Base.metadata.create_all(bind=engine)
app.include_router(auth.router)
app.include_router(protected.router)

@app.get("/")
def test_db():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "Database connected successfully!"}
    except Exception as e:
        return {"error": str(e)}
    






