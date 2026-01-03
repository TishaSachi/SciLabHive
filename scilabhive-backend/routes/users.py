from fastapi import APIRouter, Depends
from security import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me")
def get_me(current_user = Depends(get_current_user)):
    return {
        "message": "You are authenticated",
        "user_id": current_user.id,
        "email": current_user.email
    }
