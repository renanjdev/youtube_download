from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from . import models

ALLOWED_MODES = {"video", "audio"}
ALLOWED_TYPES = {"single", "playlist"}


def get_user(db: Session, user_id: UUID):
    return db.query(models.User).filter(models.User.id == user_id).one_or_none()


def ensure_user(db: Session, user_id: UUID):
    user = get_user(db, user_id)
    if user:
        return user
    placeholder = models.User(id=user_id, email=f"user_{user_id}@example.com", password="changeme123")
    db.add(placeholder)
    db.commit()
    db.refresh(placeholder)
    return placeholder


def create_job(db: Session, user_id: UUID, url: str, mode: str, job_type: str):
    if mode not in ALLOWED_MODES:
        raise ValueError("mode inválido")
    if job_type not in ALLOWED_TYPES:
        raise ValueError("type inválido")
    job = models.Job(user_id=user_id, url=url, mode=mode, type=job_type)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def list_jobs(db: Session, user_id: UUID):
    return db.query(models.Job).filter(models.Job.user_id == user_id).order_by(models.Job.created_at.desc()).all()


def get_job(db: Session, job_id: UUID):
    return db.query(models.Job).filter(models.Job.id == job_id).one_or_none()


def update_job_status(db: Session, job_id: UUID, status: str):
    job = get_job(db, job_id)
    if not job:
        return None
    job.status = status
    db.commit()
    db.refresh(job)
    return job


def create_file(db: Session, job_id: UUID, file_url: str, file_type: str):
    file = models.File(job_id=job_id, file_url=file_url, file_type=file_type)
    db.add(file)
    db.commit()
    db.refresh(file)
    return file


def get_file(db: Session, file_id: UUID):
    return db.query(models.File).filter(models.File.id == file_id).one_or_none()
