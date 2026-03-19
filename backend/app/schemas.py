from pydantic import BaseModel, HttpUrl
from typing import List
from uuid import UUID
from datetime import datetime

class JobCreate(BaseModel):
    url: HttpUrl
    mode: str
    type: str

class FileResponse(BaseModel):
    id: UUID
    file_url: HttpUrl
    file_type: str
    created_at: datetime

class JobStatusResponse(BaseModel):
    id: UUID
    status: str
    mode: str
    type: str
    url: HttpUrl
    created_at: datetime
    files: List[FileResponse] = []
