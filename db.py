import redis, os, time
from urllib.parse import urlparse

# for heroku deployment
cache = None

def get_cache():
    global cache
    if cache is None:
        retries = 5
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

        for i in range(retries):
            try:
                cache = redis.from_url(os.environ.get("REDISCLOUD_URL"))
                if cache.ping():
                    print("Connected to Redis")
                    return cache
            except redis.ConnectionError:
                print(f"Redis connection failed, retrying {i+1}/{retries}...")
                time.sleep(3)  # Wait before retrying
        raise Exception("Could not connect to Redis after multiple attempts")
    return cache
# cache = redis.Redis()


def store_user_in_room(room_id, user_id):
    cache.sadd(room_id, user_id)


def remove_user_from_room(room_id, user_id):
    cache.srem(room_id, user_id)


def get_users_in_room(room_id):
    return cache.scard(room_id)


def remove_room_expiration(room):
    cache.persist(room)
