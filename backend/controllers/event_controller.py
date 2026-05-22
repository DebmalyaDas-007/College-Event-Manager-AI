from fastapi import Request, HTTPException, status
from models.event_model import EventCreate
from services.event_service import create_event_in_db

async def create_event(
    request: Request,
    event: EventCreate
):
    try:
        user_id = request.state.user.get("sub", "anonymous") if hasattr(request.state, "user") and request.state.user else "anonymous"
        
        new_event = create_event_in_db(event, user_id)
        
        return {
            "success": True,
            "message": "Event created successfully",
            "data": new_event
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
