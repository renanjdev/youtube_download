from rq import Queue

from .redis_client import get_redis_client


def get_job_queue():
    redis_client = get_redis_client()
    if not redis_client:
        return None
    return Queue("media", connection=redis_client)


def enqueue_media_job(job_id: str):
    queue = get_job_queue()
    if not queue:
        return None
    return queue.enqueue(
        "worker.tasks.process_job",
        job_id,
        job_timeout="1h",
        failure_ttl=86400,
    )
