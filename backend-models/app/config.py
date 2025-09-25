# --- REDDIT API CREDENTIALS ---
REDDIT_CLIENT_ID = "ZNFgTJ67oExlUX_fEIYzGw"
REDDIT_CLIENT_SECRET = "HvwZo9J4FTozNQrRkaZsWd6FkLiGvQ"
REDDIT_USER_AGENT = "IndiaOceanAlerter v1.0 by ayush_696914"
REDDIT_SUBREDDIT = "india"
REDDIT_SEARCH_QUERY = "(cyclone OR tsunami OR spill OR flood OR storm) AND India"

# --- NEWSAPI CREDENTIALS ---
NEWSAPI_KEY = "6cceb5d5e3784766ad46731753c51238"
# UPDATED: Make the query more specific to find actual warnings and alerts
NEWSAPI_SEARCH_QUERY = '"tsunami alert" OR "cyclone warning" OR "coastal flood" OR "oil spill" AND India'

# --- GOOGLE ALERTS ---
GOOGLE_ALERTS_RSS_URL = "https://www.google.com/alerts/feeds/05285563936828042999/4381527242689804364"

# --- SHARED SETTINGS ---
SLEEP_TIME_SECONDS = 300
MAX_ALERTS_STORED = 100

# --- FILTERING KEYWORDS ---
TRUSTED_DOMAINS = [
    'ndtv.com', 'timesofindia.indiatimes.com', 'thehindu.com',
    'pib.gov.in', 'imd.gov.in', 'ndma.gov.in'
]
NEGATIVE_KEYWORDS = [
    'hits out', 'slams', 'blames', 'criticizes', 'politics', 
    'touring', 'gandhi', 'modi', 'kejriwal', 'bjp', 'congress', 'aap',
    'bill', 'parliament', 'election', 'meeting' # Added more non-hazard terms
]