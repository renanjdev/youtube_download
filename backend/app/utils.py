from urllib.parse import urlparse
from fastapi import HTTPException, status

ALLOWED_SCHEMES = {"http", "https"}


def validate_job_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in ALLOWED_SCHEMES or not parsed.netloc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL inválida",
        )
    return url


def health_check():
    return True
