from fastapi import APIRouter, Depends
from security import get_current_user
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(
    prefix="/protected",
    tags=["Protected"]
)

# Define oauth2_scheme here
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.get("/protected")
def protected_route(token: str = Depends(oauth2_scheme)):
    return {"token": token}
