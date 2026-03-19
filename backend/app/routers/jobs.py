from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from ..config import get_settings
from ..crud import create_job as create_job_record, list_jobs, get_job as find_job
from ..dependencies import get_db, get_current_user, enforce_rate_limit
from ..queue import enqueue_media_job
from ..schemas import FileResponse, JobCreate, JobStatusResponse
from ..worker import process_job
from ..utils import validate_job_url

router = APIRouter()
settings = get_settings()


def to_response(job) -> JobStatusResponse:
    return JobStatusResponse(
        id=job.id,
        status=job.status,
        mode=job.mode,
        type=job.type,
        url=job.url,
        created_at=job.created_at,
        files=[
            FileResponse(
                id=file.id,
                file_url=file.file_url,
                file_type=file.file_type,
                created_at=file.created_at,
            )
            for file in getattr(job, "files", [])
        ],
    )


@router.post("/jobs", response_model=JobStatusResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_payload: JobCreate,
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enforce_rate_limit(user.id)
    job_url = str(job_payload.url)
    validate_job_url(job_url)
    try:
        job = create_job_record(db, user.id, job_url, job_payload.mode, job_payload.type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    job_id = str(job.id)
    if settings.REDIS_URL:
        enqueue_media_job(job_id)
    else:
        background_tasks.add_task(process_job, job_id)
    return to_response(job)


@router.get("/jobs", response_model=list[JobStatusResponse])
def read_jobs(user=Depends(get_current_user), db: Session = Depends(get_db)):
    jobs = list_jobs(db, user.id)
    return [to_response(job) for job in jobs]


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def read_job(job_id: UUID, user=Depends(get_current_user), db: Session = Depends(get_db)):
    job = find_job(db, job_id)
    if not job or job.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job não encontrado")
    return to_response(job)
