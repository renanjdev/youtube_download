from functools import lru_cache
from pathlib import Path
from pydantic.v1 import BaseSettings, validator

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str | None = None
    STORAGE_BUCKET: str = "downloads"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    YOUTUBE_COOKIE_FILE: str | None = None
    YOUTUBE_PO_TOKEN: str | None = None
    YOUTUBE_PLAYER_CLIENTS: str | None = None
    JOBS_PER_HOUR: int = 5
    MAX_FILES_PER_JOB: int = 100
    FILE_EXPIRATION_SECONDS: int = 3600
    DB_CONNECT_TIMEOUT_SECONDS: int = 10
    DB_POOL_RECYCLE_SECONDS: int = 300
    DB_POOL_PRE_PING: bool = True

    class Config:
        env_file = Path(__file__).resolve().parents[2] / ".env"
        case_sensitive = True

    @validator(
        "JOBS_PER_HOUR",
        "MAX_FILES_PER_JOB",
        "DB_CONNECT_TIMEOUT_SECONDS",
        "DB_POOL_RECYCLE_SECONDS",
        pre=True,
    )
    def ensure_positive(cls, v):
        if isinstance(v, str):
            v = int(v)
        if v <= 0:
            raise ValueError("Value must be positive")
        return v

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
