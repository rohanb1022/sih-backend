import requests
import time
from app import config

articles_already_seen = set()

# A list of our core hazard keywords to check against the title
HAZARD_KEYWORDS = ['cyclone', 'tsunami', 'flood', 'spill', 'storm', 'earthquake', 'warning', 'alert']

def check_newsapi(shared_alerts_queue):
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
                        
                        # NEW FILTER 1: Check if a real hazard keyword is in the title
                        has_hazard_keyword = any(keyword in title_lower for keyword in HAZARD_KEYWORDS)
                        
                        # NEW FILTER 2: Check for negative/political keywords in the title
                        has_negative_keyword = any(keyword in title_lower for keyword in config.NEGATIVE_KEYWORDS)
                        
                        # Only store the alert if it's relevant and not political
                        if has_hazard_keyword and not has_negative_keyword:
                            alert = {"source": "NewsAPI", "title": article['title'], "url": article['url']}
                            shared_alerts_queue.appendleft(alert)
                            print(f"--- NewsAPI Alert Stored: {article['title'][:50]}... ---")
                            
                        articles_already_seen.add(article['title'])
            else:
                print(f"Error from NewsAPI: {data.get('message')}")
        except Exception as e:
            print(f"An error occurred in NewsAPI worker: {e}")
        
        print(f"NewsAPI check complete. Waiting for {config.SLEEP_TIME_SECONDS / 60} minutes...")
        time.sleep(config.SLEEP_TIME_SECONDS)