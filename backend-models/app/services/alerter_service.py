import threading
from app.services import reddit_service, newsapi_service, google_alerts_service

def start_background_tasks():
    print("Initializing background monitoring services...")
    
    # We no longer need a shared queue, just start the functions
    reddit_thread = threading.Thread(target=reddit_service.check_reddit, daemon=True)
    newsapi_thread = threading.Thread(target=newsapi_service.check_newsapi, daemon=True)
    google_alerts_thread = threading.Thread(target=google_alerts_service.check_google_alerts, daemon=True)

    reddit_thread.start()
    newsapi_thread.start()
    google_alerts_thread.start()

    print("All monitoring services are running in the background, sending alerts to the Node.js backend.")