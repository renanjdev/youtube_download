from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from .database import SessionLocal
from .crud import ensure_user
from .config import get_settings

settings = get_settings()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    x_user_id: str = Header(..., alias="X-User-Id"), db: Session = Depends(get_db)
):
    try:
        user_id = UUID(x_user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="X-User-Id inválido")
    user = ensure_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return user


def enforce_rate_limit(user_id: UUID):
    pass
