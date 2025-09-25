from fastapi import APIRouter
from app.services.alerter_service import shared_alerts_queue
from typing import Optional

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)

@router.get("/")
def get_alerts(location: Optional[str] = None):
    """
    Returns the latest alerts collected from all sources.
    If a 'location' query parameter is provided (e.g., /alerts?location=Mumbai),
    it filters the alerts to only include those whose titles contain the location name.
    """
    all_alerts = list(shared_alerts_queue)
    
    # If a location is provided in the request, filter the results
    if location:
        filtered_alerts = [
            alert for alert in all_alerts 
            if location.lower() in alert.get('title', '').lower()
        ]
        return {"alerts": filtered_alerts}
        
    # If no location is provided, return all alerts
    return {"alerts": all_alerts}