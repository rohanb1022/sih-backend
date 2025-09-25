import feedparser
import time
from app import config

entries_already_seen = set()

def check_google_alerts(shared_alerts_queue):
    print("Checking Google Alerts RSS feed...")
    while True:
        try:
            feed = feedparser.parse(config.GOOGLE_ALERTS_RSS_URL)
            for entry in feed.entries:
                if entry.id not in entries_already_seen:
                    if "india" in entry.title.lower():
                        alert = {"source": "Google Alerts", "title": entry.title, "url": entry.link}
                        shared_alerts_queue.appendleft(alert)
                        print(f"--- Google Alert Stored: {entry.title[:50]}... ---")
                    entries_already_seen.add(entry.id)
        except Exception as e:
            print(f"An error occurred in Google Alerts worker: {e}")
        
        print(f"Google Alerts check complete. Waiting for {config.SLEEP_TIME_SECONDS / 60} minutes...")
        time.sleep(config.SLEEP_TIME_SECONDS)