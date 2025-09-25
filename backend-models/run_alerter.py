import time
from app.services import alerter_service

# This script's only job is to start the background tasks and keep running.
if __name__ == "__main__":
    print("Starting the alerter background worker...")
    alerter_service.start_background_tasks()
    
    # Keep the main thread alive so the background threads can run
    while True:
        time.sleep(60)