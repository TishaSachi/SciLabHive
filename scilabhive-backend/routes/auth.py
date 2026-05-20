from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import File, UploadFile
import shutil, os, uuid

from database import get_db
from models import User
from schemas import UserCreate, UserResponse, Token, UserUpdate, ChangePassword, AvatarResponse, AvatarUpdate
from security import get_current_user, hash_password, verify_password, create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# ── GET current user ──
@router.get("/me", response_model=UserResponse)
def get_me(current_user = Depends(get_current_user)):
    return current_user


@router.post("/register", response_model=UserResponse, status_code=201)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="user",
        institution=user.institution,
        user_role=user.user_role
    )

    print("Saving user:", new_user.full_name, new_user.email, new_user.institution, new_user.user_role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
def login_user(
    credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # OAuth2PasswordRequestForm uses 'username', treat as email
    user = db.query(User).filter(User.email == credentials.username).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ── UPDATE profile ──
@router.put("/me", response_model=UserResponse)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    current_user.full_name   = data.full_name
    current_user.institution = data.institution
    current_user.user_role   = data.user_role
    db.commit()
    db.refresh(current_user)
    return current_user


# ── CHANGE PASSWORD ──
@router.put("/change-password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


# ── UPLOAD AVATAR ──

@router.put("/upload-avatar", response_model=UserResponse)
def upload_avatar(
    data: AvatarUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Validate it's actually a base64 image
    if not data.avatar_base64.startswith('data:image/'):
        raise HTTPException(status_code=400, detail="Invalid image format")

    current_user.avatar_url = data.avatar_base64
    db.commit()
    db.refresh(current_user)
    return current_user


