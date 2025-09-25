from fastapi import FastAPI
from app.routers import alerts
from app.services import alerter_service

app = FastAPI(
    title="Ocean Hazard Monitoring Backend",
    description="An API that monitors Reddit, NewsAPI, and Google Alerts for ocean-related hazards in India."
)

app.include_router(alerts.router)

@app.on_event("startup")
def on_startup():
    alerter_service.start_background_tasks()

@app.get("/")
def read_root():
    return {"status": "Server is running. Navigate to /docs for API documentation."}