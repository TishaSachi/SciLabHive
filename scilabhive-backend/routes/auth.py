from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import File, UploadFile
import shutil, os, uuid

from database import get_db
from models import User
from schemas import UserCreate, UserResponse, Token, UserUpdate, ChangePassword, AvatarResponse, AvatarUpdate
from security import get_current_user, hash_password, verify_password, create_access_token

import random, string
from datetime import datetime, timedelta, timezone
from email_service import send_otp_email
from schemas import VerifyOTPRequest, ResendOTPRequest

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# ── GET current user ──
@router.get("/me", response_model=UserResponse)
def get_me(current_user = Depends(get_current_user)):
    return current_user

# ---- register User -----
@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    otp     = generate_otp()
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)

    new_user = User(
        full_name      = user.full_name,
        email          = user.email,
        hashed_password= hash_password(user.password),
        role           = "user",
        institution    = user.institution,
        user_role      = user.user_role,
        is_verified    = False,
        otp_code       = otp,
        otp_expires_at = expires,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send OTP email
    await send_otp_email(new_user.email, otp, new_user.full_name)

    return new_user


# -------------- login user -----------

@router.post("/login", response_model=Token)
def login_user(
    credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == credentials.username).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password",
                            headers={"WWW-Authenticate": "Bearer"})

    # Block unverified users
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="EMAIL_NOT_VERIFIED")

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ── Verify OTP ──
@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        return {"message": "Already verified"}

    if user.otp_code != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code")

    if datetime.now(timezone.utc) > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired")

    # Mark as verified and clear OTP
    user.is_verified    = True
    user.otp_code       = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Email verified successfully"}


# ── Resend OTP ──
@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        return {"message": "Already verified"}

    otp     = generate_otp()
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)

    user.otp_code       = otp
    user.otp_expires_at = expires
    db.commit()

    await send_otp_email(user.email, otp, user.full_name)

    return {"message": "OTP resent"}


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


@router.delete("/me", status_code=204)
def delete_account(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return


