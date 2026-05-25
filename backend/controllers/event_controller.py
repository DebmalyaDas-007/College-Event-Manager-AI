"""
Nexus AI — Event Controller
File: controllers/event_controller.py
"""

from fastapi import Request, HTTPException, status
from models.event_model import EventCreate, EventResponse, EventStatus
from services.event_service import create_event_in_db, get_events_by_organizer, get_all_events_from_db
from controllers.auth_controller import get_clerk_id_from_request

async def get_my_events(request: Request):
    """
    GET /api/v1/events/my-events
    Retrieves events created by the currently authenticated admin/organizer.
    """
    clerk_id = get_clerk_id_from_request(request)
    events = get_events_by_organizer(clerk_id)
    return events

async def get_all_events(request: Request):
    """
    GET /api/v1/events
    Retrieves all campus events listed in the system.
    """
    # Ensure caller is authenticated
    get_clerk_id_from_request(request)
    events = get_all_events_from_db()
    return events

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
