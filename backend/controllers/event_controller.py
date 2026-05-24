"""
Nexus AI — Event Controller
File: controllers/event_controller.py
"""

from fastapi import Request, HTTPException, status
from models.event_model import EventCreate, EventResponse, EventStatus
from services.event_service import create_event_in_db
from controllers.auth_controller import get_clerk_id_from_request

async def create_event(request: Request, event_data: EventCreate) -> EventResponse:
    """
    POST /api/v1/events
    Creates a new event with the logged-in administrator/organizer credentials.
    """
    clerk_id = get_clerk_id_from_request(request)
    
    # Create the event database entry
    event_dict = create_event_in_db(event_data, clerk_id)
    
    # Populate missing defaults to ensure smooth Pydantic EventResponse validation
    if "status" not in event_dict or not event_dict["status"]:
        event_dict["status"] = EventStatus.DRAFT
        
    if "current_participants" not in event_dict:
        event_dict["current_participants"] = 0
        
    if "fomo_score" not in event_dict:
        event_dict["fomo_score"] = 0.0
        
    return EventResponse(**event_dict)
