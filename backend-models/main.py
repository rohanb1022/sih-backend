from fastapi import FastAPI
import praw
import time
import threading

# --- CONFIGURATION ---
# Paste your Reddit API credentials here
CLIENT_ID = "ZNFgTJ67oExlUX_fEIYzGw"
CLIENT_SECRET = "HvwZo9J4FTozNQrRkaZsWd6FkLiGvQ"
USER_AGENT = "IndiaOceanAlerter v1.0 by ayush_696914"

SUBREDDIT_TO_CHECK = "india"
SEARCH_QUERY = "(cyclone OR tsunami OR spill OR flood OR storm) AND India"
SLEEP_TIME = 300

TRUSTED_DOMAINS = [
    'ndtv.com', 
    'timesofindia.indiatimes.com',
    'thehindu.com',
    'pib.gov.in',
    'imd.gov.in',
    'ndma.gov.in'
]

# NEW: List of keywords to filter out political/unwanted posts
NEGATIVE_KEYWORDS = [
    'hits out', 'slams', 'blames', 'criticizes', 'politics', 
    'touring', 'gandhi', 'modi', 'kejriwal', 'bjp', 'congress', 'aap'
]

posts_already_alerted = set()

# --- FASTAPI APP SETUP ---
app = FastAPI(title="Ocean Hazard Alerter")

@app.get("/")
def root():
    return {"message": "FastAPI server is running. Reddit alerter is active in the background. 🚀"}

# --- REDDIT ALERTER LOGIC ---
def send_alert(post):
    print("--- NEW HAZARD ALERT! ---")
    print(f"Title: {post.title}")
    print(f"URL: {post.url}")
    print("-------------------------")

def check_for_hazards():
    print("Connecting to Reddit...")
    reddit = praw.Reddit(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        user_agent=USER_AGENT,
    )
    
    print(f"Successfully connected. Monitoring r/{SUBREDDIT_TO_CHECK} for new posts...")
    
    while True:
        try:
            subreddit = reddit.subreddit(SUBREDDIT_TO_CHECK)
            search_results = subreddit.search(SEARCH_QUERY, sort='new', limit=25)

            for post in search_results:
                if post.id not in posts_already_alerted:
                    is_trusted_source = any(domain in post.url for domain in TRUSTED_DOMAINS)
                    
                    if is_trusted_source:
                        # NEW: Second check for negative keywords in the title
                        post_title_lower = post.title.lower()
                        has_negative_keyword = any(keyword in post_title_lower for keyword in NEGATIVE_KEYWORDS)
                        
                        if not has_negative_keyword:
                            send_alert(post)
                    
                    posts_already_alerted.add(post.id)
        
        except Exception as e:
            print(f"An error occurred: {e}")
            time.sleep(60)
            
        print(f"Check complete. Waiting for {SLEEP_TIME / 60} minutes...")
        time.sleep(SLEEP_TIME)

# --- START BACKGROUND TASK ---
@app.on_event("startup")
async def startup_event():
    print("Starting Reddit alerter as a background thread.")
    thread = threading.Thread(target=check_for_hazards, daemon=True)
    thread.start()