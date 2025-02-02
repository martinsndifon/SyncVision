import redis, os
from urllib.parse import urlparse

cache = None

def get_cache():
    global cache
    if cache is None:
        redis_url = os.environ.get("REDISCLOUD_URL")
        parsed_url = urlparse(redis_url)
        REDIS_IP = "34.228.42.204"
        REDIS_HOST = parsed_url.hostname
        REDIS_PORT = parsed_url.port
        REDIS_PASSWORD = parsed_url.password

        # Print to verify (REMOVE before deploying for security)
        print("Redis Host:", REDIS_HOST)
        print("Redis Port:", REDIS_PORT)
        print("Redis Password:", REDIS_PASSWORD)

        try:
            cache = redis.Redis(
                host=REDIS_IP,
                port=REDIS_PORT,
                password=REDIS_PASSWORD,
            )
            if cache.ping():
                print("Connected to Redis")
                return cache
        except redis.ConnectionError as e:
            print(f"Redis connection failed:", e)

    return cache