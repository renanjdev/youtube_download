from rq import Queue
from .redis_client import redis_client

job_queue = Queue("media", connection=redis_client)
