# Backend FastAPI

## Setup

1. Create a virtual environment and install dependencies:
   `ash
   python -m venv .venv
   source .venv/bin/activate  # or .venv\\Scripts\\activate on Windows
   pip install -r requirements.txt
   `
2. Copy .env.example to .env and set DATABASE_URL, REDIS_URL and AWS credentials.
3. Run migrations/schema creation:
   `ash
   uvicorn app.main:app --reload
   `

## Redis queue

- The API enqueues jobs via RQ in the media queue.
- Worker should import worker.tasks.process_job to process payloads.
