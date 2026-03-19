from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker
from .config import get_settings

settings = get_settings()


def build_database_url(raw_url: str) -> str:
    normalized = raw_url.replace("postgres://", "postgresql://", 1)
    url = make_url(normalized)
    query = dict(url.query)

    if url.host and "supabase.com" in url.host:
        query.setdefault("sslmode", "require")

    query.setdefault("connect_timeout", str(settings.DB_CONNECT_TIMEOUT_SECONDS))
    return url.set(query=query).render_as_string(hide_password=False)


engine = create_engine(
    build_database_url(settings.DATABASE_URL),
    future=True,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_recycle=settings.DB_POOL_RECYCLE_SECONDS,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
