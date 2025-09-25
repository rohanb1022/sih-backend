import praw
import time
from app import config

posts_already_seen = set()

def check_reddit(shared_alerts_queue):
    print("Connecting to Reddit...")
    try:
        reddit = praw.Reddit(
            client_id=config.REDDIT_CLIENT_ID,
            client_secret=config.REDDIT_CLIENT_SECRET,
            user_agent=config.REDDIT_USER_AGENT,
        )
        print(f"Successfully connected. Monitoring r/{config.REDDIT_SUBREDDIT}...")
    except Exception as e:
        print(f"ERROR: Could not connect to Reddit. Check credentials. Error: {e}")
        return

    while True:
        try:
            subreddit = reddit.subreddit(config.REDDIT_SUBREDDIT)
            search_results = subreddit.search(config.REDDIT_SEARCH_QUERY, sort='new', limit=25)

            for post in search_results:
                if post.id not in posts_already_seen:
                    is_trusted = any(domain in post.url for domain in config.TRUSTED_DOMAINS)
                    if is_trusted:
                        post_title_lower = post.title.lower()
                        has_negative = any(keyword in post_title_lower for keyword in config.NEGATIVE_KEYWORDS)
                        if not has_negative:
                            alert = {"source": "Reddit", "title": post.title, "url": post.url}
                            shared_alerts_queue.appendleft(alert)
                            print(f"--- Reddit Alert Stored: {post.title[:50]}... ---")
                    posts_already_seen.add(post.id)
        except Exception as e:
            print(f"An error occurred in Reddit worker: {e}")
            time.sleep(60)
            
        print(f"Reddit check complete. Waiting for {config.SLEEP_TIME_SECONDS / 60} minutes...")
        time.sleep(config.SLEEP_TIME_SECONDS)