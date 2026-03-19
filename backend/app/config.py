from functools import lru_cache
from pathlib import Path
from pydantic import BaseSettings, validator

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    STORAGE_BUCKET: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "us-east-1"
    JOBS_PER_HOUR: int = 5
    MAX_FILES_PER_JOB: int = 100
    FILE_EXPIRATION_SECONDS: int = 3600

    class Config:
        env_file = Path(__file__).resolve().parents[2] / ".env"
        case_sensitive = True

    @validator("JOBS_PER_HOUR", "MAX_FILES_PER_JOB", pre=True)
    def ensure_positive(cls, v):
        if isinstance(v, str):
            v = int(v)
        if v <= 0:
            raise ValueError("Value must be positive")
        return v

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
