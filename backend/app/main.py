from fastapi import FastAPI
from .database import engine
from .models import Base
from .routers.jobs import router as jobs_router
from .routers.files import router as files_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Media SaaS API", version="0.1.0")

app.include_router(jobs_router)
app.include_router(files_router)

@app.get("/healthz")
def health_check():
    return {"status": "ok"}
