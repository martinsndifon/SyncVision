import redis, os
from urllib.parse import urlparse

cache = None

def get_cache():
    global cache
    if cache is None:
        redis_url = os.environ.get("REDISCLOUD_URL")
        parsed_url = urlparse(redis_url)
        REDIS_IP = os.environ.get("REDIS_IP")
        REDIS_HOST = parsed_url.hostname
        REDIS_PORT = parsed_url.port
        REDIS_PASSWORD = parsed_url.password

        try:
            cache = redis.Redis(
                host=REDIS_IP,
                port=REDIS_PORT,
                password=REDIS_PASSWORD,
            )
            if cache.ping():
                # print("Connected to Redis")
                return cache
        except redis.ConnectionError as e:
            # print(f"Redis connection failed:", e)
            pass

    return cache