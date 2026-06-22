from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)
    institution: Optional[str] = None          # ← NEW (optional)
    user_role: Optional[str] = None  


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    institution: str | None = None
    user_role: str | None = None
    avatar_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr



# ------------------------------ EXPERIMENT SCHEMAS ------------------------------------

class ExperimentCreate(BaseModel):
    title: str
    experiment_type: str
    description: str | None = None
    status: str = "Planned"


class ExperimentResponse(BaseModel):
    experiment_id: int
    title: str
    experiment_type: str
    description: str | None
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime | None = None 

    class Config:
        from_attributes = True


# --------------------------- EXPERIMENT PARAMETERS SCHEMAS ---------------------------

class ExperimentParameterCreate(BaseModel):
    param_name: str
    param_value: str | None


class ExperimentParameterResponse(BaseModel):
    param_id: int
    param_name: str
    param_value: str | None
    experiment_id: int

    class Config:
        from_attributes = True


       
# --------------------------- EXPERIMENT RESULTS SCHEMAS ---------------------------

class ExperimentResultCreate(BaseModel):
    result_name: str
    result_value: str | None
    result_unit: str | None = None


class ExperimentResultResponse(BaseModel):
    result_id: int
    result_name: str
    result_value: str | None
    result_unit: str | None = None
    experiment_id: int
    created_at: datetime        

    class Config:
        from_attributes = True


# --------------------------- User profile schemas ---------------------------------

class UserUpdate(BaseModel):
    full_name: str
    institution: Optional[str] = None
    user_role: Optional[str] = None

class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=64)
    
class AvatarResponse(BaseModel):
    avatar_url: str


# In schemas.py add:
class AvatarUpdate(BaseModel):
    avatar_base64: str


# --------------------- Collaborator schemas ----------------------------

class CollaboratorInvite(BaseModel):
    experiment_id: int
    invite_email:  EmailStr
    role:          str = "viewer"

class CollaboratorResponse(BaseModel):
    id:               int
    experiment_id:    int
    invite_email:     str
    role:             str
    status:           str
    invited_at:       datetime
    accepted_at:      Optional[datetime] = None
    collaborator_id:  Optional[int]      = None

    class Config:
        from_attributes = True

class CollaboratorWithUser(CollaboratorResponse):
    collaborator_name:  Optional[str] = None
    collaborator_email: Optional[str] = None
    experiment_title:   Optional[str] = None