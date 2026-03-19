from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.orm import Session

from ..crud import get_file
from ..schemas import FileResponse
from ..dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/files/{file_id}", response_model=FileResponse)
def get_processed_file(
    file_id: UUID, user=Depends(get_current_user), db: Session = Depends(get_db)
):
    file = get_file(db, file_id)
    if not file or file.job.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arquivo não encontrado")
    return FileResponse(
        id=file.id,
        file_url=file.file_url,
        file_type=file.file_type,
        created_at=file.created_at,
    )
