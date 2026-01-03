from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# =========================
# EXPERIMENT SCHEMAS
# =========================
class ExperimentCreate(BaseModel):
    title: str
    experiment_type: str
    description: str | None = None


class ExperimentResponse(BaseModel):
    experiment_id: int
    title: str
    experiment_type: str
    description: str | None
    user_id: int

    class Config:
        from_attributes = True







