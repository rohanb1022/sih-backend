from fastapi import FastAPI
from app.services import alerter_service

app = FastAPI(
    title="Ocean Hazard Alerter Worker",
    description="A background worker that finds hazard alerts and sends them to the main API."
)

@app.on_event("startup")
def on_startup():
    alerter_service.start_background_tasks()

@app.get("/")
def read_root():
    return {"status": "Alerter worker is running."}