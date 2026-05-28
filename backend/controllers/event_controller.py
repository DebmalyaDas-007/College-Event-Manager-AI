from fastapi import Request, HTTPException, status
from models.event_model import EventCreate, EventResponse, OrganizerType
from services.event_service import create_event_in_db, get_events_by_organizer, get_all_events_from_db
from controllers.auth_controller import get_clerk_id_from_request

async def get_my_events(request: Request):
    clerk_id = get_clerk_id_from_request(request)
    events = get_events_by_organizer(clerk_id)
    return events

async def get_all_events(request: Request):
    get_clerk_id_from_request(request)
    events = get_all_events_from_db()
    return events

async def create_event(request: Request, event_data: EventCreate) -> EventResponse:
    clerk_id = get_clerk_id_from_request(request)
    
    # Resolve organizer profiles or defaults matching metadata records
    from services.admin_service import get_admin_by_clerk_id
    admin_profile = get_admin_by_clerk_id(clerk_id)
    
    if not event_data.organizer_id:
        event_data.organizer_id = clerk_id
        
    if admin_profile:
        if not event_data.organizer_type:
            role = admin_profile.get("admin_role")
            if role == "college_admin":
                event_data.organizer_type = OrganizerType.ADMIN
            elif role == "fest_organizer":
                event_data.organizer_type = OrganizerType.EXTERNAL
            else:
                event_data.organizer_type = OrganizerType.CLUB
                
        if not event_data.college:
            club_prof = admin_profile.get("club_profile")
            if club_prof and isinstance(club_prof, dict):
                event_data.college = club_prof.get("college") or admin_profile.get("managed_college_id") or "Jadavpur University"
            else:
                event_data.college = admin_profile.get("managed_college_id") or "Jadavpur University"
    else:
        if not event_data.organizer_type:
            event_data.organizer_type = OrganizerType.CLUB
        if not event_data.college:
            event_data.college = "Jadavpur University"
            
    # Create database entry and cleanly map variables
    event_dict = create_event_in_db(event_data, clerk_id)
    
    # Pydantic validation handles parsing cleanly now that types match!
    return EventResponse(**event_dict)