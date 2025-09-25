import threading
from collections import deque
from app import config
from app.services import reddit_service, newsapi_service, google_alerts_service

shared_alerts_queue = deque(maxlen=config.MAX_ALERTS_STORED)

def start_background_tasks():
    print("Initializing background monitoring services...")

    reddit_thread = threading.Thread(target=reddit_service.check_reddit, args=(shared_alerts_queue,), daemon=True)
    newsapi_thread = threading.Thread(target=newsapi_service.check_newsapi, args=(shared_alerts_queue,), daemon=True)
    google_alerts_thread = threading.Thread(target=google_alerts_service.check_google_alerts, args=(shared_alerts_queue,), daemon=True)

    reddit_thread.start()
    newsapi_thread.start()
    google_alerts_thread.start()

    print("All monitoring services are running in the background.")