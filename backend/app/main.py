from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
from .database import engine
from .models import Base
from .routers.jobs import router as jobs_router
from .routers.files import router as files_router

from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables checked/created perfectly.")
    except Exception as e:
        logger.error(f"Failed to reach DB on startup (Render might still boot): {e}")
    yield

app = FastAPI(title="JEAN Tube API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)
app.include_router(files_router)

@app.get("/healthz")
def health_check():
    return {"status": "ok"}
