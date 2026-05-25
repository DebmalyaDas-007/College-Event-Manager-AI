"""
Nexus AI — User Controller
File: controllers/user_controller.py
"""

from fastapi import Request, HTTPException, status
from bson import ObjectId
from database.db import user_collection
from models.user_model import UserCreate, UserResponse, UserPublic, UserProfileUpdate
from services.user_service import (
    create_user,
    update_user_profile,
    bookmark_event_in_db,
    unbookmark_event_in_db,
    register_event_in_db
)

async def register_user_profile(user_data: UserCreate) -> UserResponse:
    """
    POST /api/v1/users
    Registers a new user (can be called via Clerk webhook or manual register).
    """
    user_dict = create_user(user_data)
    return UserResponse(**user_dict)


async def update_user_profile_handler(request: Request, profile_data: UserProfileUpdate) -> UserResponse:
    """
    PATCH /api/v1/users/me
    Updates profile details for the currently logged-in user.
    """
    # 1. Grab the auth payload attached by verify_clerk_token middleware
    user_payload = getattr(request.state, "user", None)
    if not user_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: User session state not found."
        )
    
    # Clerk stores the unique user identifier in the 'sub' (subject) token claim
    clerk_id = user_payload.get("sub")
    if not clerk_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid token claims."
        )

    # 2. Forward updates to the service layer
    updated_user = update_user_profile(clerk_id, profile_data)
    return UserResponse(**updated_user)


async def get_public_profile(user_id: str) -> UserPublic:
    """
    GET /api/v1/users/{user_id}
    Retrieves public profile details of a user. Supports both MongoDB _id and clerk_id.
    """
    user = None
    
    # Try finding by MongoDB ObjectId first
    try:
        if ObjectId.is_valid(user_id):
            user = user_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
        
    # Fallback to clerk_id search
    if not user:
        user = user_collection.find_one({"clerk_id": user_id})
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    # Map fields for UserPublic safely
    return UserPublic(
        id=str(user["_id"]),
        name=user.get("name", "New User"),
        avatar=user.get("avatar"),
        college=user.get("college", "Not Specified"),
        department=user.get("department")
    )


async def bookmark_event(request: Request, event_id: str) -> UserResponse:
    """
    POST /api/v1/users/bookmark/{event_id}
    Bookmarks an event for the currently authenticated user.
    """
    user_payload = getattr(request.state, "user", None)
    clerk_id = user_payload.get("sub") if user_payload else None
    
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    updated_user = bookmark_event_in_db(clerk_id, event_id)
    return UserResponse(**updated_user)


async def unbookmark_event(request: Request, event_id: str) -> UserResponse:
    """
    DELETE /api/v1/users/bookmark/{event_id}
    Removes an event from the authenticated user's bookmarks.
    """
    user_payload = getattr(request.state, "user", None)
    clerk_id = user_payload.get("sub") if user_payload else None
    
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    updated_user = unbookmark_event_in_db(clerk_id, event_id)
    return UserResponse(**updated_user)


async def register_event(request: Request, event_id: str) -> UserResponse:
    """
    POST /api/v1/users/register/{event_id}
    Registers the authenticated user for an event.
    """
    user_payload = getattr(request.state, "user", None)
    clerk_id = user_payload.get("sub") if user_payload else None
    
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    updated_user = register_event_in_db(clerk_id, event_id)
    return UserResponse(**updated_user)