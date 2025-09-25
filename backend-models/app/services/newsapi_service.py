import requests
import time
from app import config

articles_already_seen = set()
HAZARD_KEYWORDS = ['cyclone', 'tsunami', 'flood', 'spill', 'storm', 'earthquake', 'warning', 'alert']

def send_alert_to_backend(alert_data: dict):
    """Sends a single alert to the Node.js backend."""
    try:
        response = requests.post(config.NODE_API_INGEST_URL, json=alert_data)
        if response.status_code == 201:
            print(f"--- NewsAPI Alert successfully sent to backend: {alert_data['title'][:50]}... ---")
        else:
            print(f"--- FAILED to send NewsAPI alert. Status: {response.status_code}, Response: {response.text} ---")
    except requests.exceptions.RequestException as e:
        print(f"--- ERROR: Could not connect to Node.js backend. Is it running? Error: {e} ---")

def check_newsapi():
    print("Connecting to NewsAPI...")
    while True:
        try:
            url = f"https://newsapi.org/v2/everything?q={config.NEWSAPI_SEARCH_QUERY}&apiKey={config.NEWSAPI_KEY}&sortBy=publishedAt"
            response = requests.get(url)
            data = response.json()
            
            if data.get('status') == 'ok':
                for article in data.get('articles', []):
                    if article['title'] not in articles_already_seen:
                        title_lower = article['title'].lower()
                        has_hazard = any(keyword in title_lower for keyword in HAZARD_KEYWORDS)
                        has_negative = any(keyword in title_lower for keyword in config.NEGATIVE_KEYWORDS)
                        
                        if has_hazard and not has_negative:
                            # --- THIS IS THE CHANGED SECTION ---
                            alert = {"source": "NewsAPI", "title": article['title'], "url": article['url']}
                            send_alert_to_backend(alert)
                            # -----------------------------------
                        articles_already_seen.add(article['title'])
            else:
                print(f"Error from NewsAPI: {data.get('message')}")
        except Exception as e:
            print(f"An error occurred in NewsAPI worker: {e}")
        
        print(f"NewsAPI check complete. Waiting for {config.SLEEP_TIME_SECONDS / 60} minutes...")
        time.sleep(config.SLEEP_TIME_SECONDS)