import feedparser
import time
import requests
import re # <-- IMPORT THE REGEX LIBRARY
from app import config

entries_already_seen = set()

def clean_html(raw_html):
    """A simple function to strip HTML tags from a string."""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext

def send_alert_to_backend(alert_data: dict):
    """Sends a single alert to the Node.js backend."""
    try:
        response = requests.post(config.NODE_API_INGEST_URL, json=alert_data)
        if response.status_code == 201:
            print(f"--- Google Alert successfully sent to backend: {alert_data['title'][:50]}... ---")
        else:
            print(f"--- FAILED to send Google Alert. Status: {response.status_code}, Response: {response.text} ---")
    except requests.exceptions.RequestException as e:
        print(f"--- ERROR: Could not connect to Node.js backend. Is it running? Error: {e} ---")

def check_google_alerts():
    print("Checking Google Alerts RSS feed...")
    while True:
        try:
            feed = feedparser.parse(config.GOOGLE_ALERTS_RSS_URL)
            for entry in feed.entries:
                if entry.id not in entries_already_seen:
                    # Clean the title before doing anything else
                    clean_title = clean_html(entry.title)
                    
                    if "india" in clean_title.lower():
                        alert = {
                            "source": "google_alerts",
                            "title": clean_title, # <-- USE THE CLEANED TITLE
                            "url": entry.link
                        }
                        send_alert_to_backend(alert)
                        
                    entries_already_seen.add(entry.id)
        except Exception as e:
            print(f"An error occurred in Google Alerts worker: {e}")
        
        print(f"Google Alerts check complete. Waiting for {config.SLEEP_TIME_SECONDS / 60} minutes...")
        time.sleep(config.SLEEP_TIME_SECONDS)