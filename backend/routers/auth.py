from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User, ContentGeneration
from schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    HistoryItem,
)
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        credits=5,  # Free credits on signup
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    user.last_login = __import__("datetime").datetime.utcnow()
    db.commit()

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)


@router.get("/history", response_model=list[HistoryItem])
def history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = (
        db.query(ContentGeneration)
        .filter(ContentGeneration.user_id == user.id)
        .order_by(ContentGeneration.created_at.desc())
        .limit(50)
        .all()
    )
    return [HistoryItem.model_validate(item) for item in items]
