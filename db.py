import redis, os, time

# for heroku deployment
cache = None

def get_cache():
    global cache
    if cache is None:
        retries = 5
        for i in range(retries):
            try:
                cache = redis.from_url(os.environ.get("REDISCLOUD_URL"), ssl=True)
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
