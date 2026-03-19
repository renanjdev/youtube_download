import redis
from .config import get_settings

settings = get_settings()


def get_redis_client():
    if not settings.REDIS_URL:
        return None
    return redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
