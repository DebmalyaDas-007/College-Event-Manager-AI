"""
Nexus AI — User Controller
File: controllers/user_controller.py
"""

from fastapi import Request, HTTPException, status
from bson import ObjectId
from database.db import user_collection, serialize_doc
from models.user_model import UserCreate, UserResponse, UserPublic
from services.user_service import (
    create_user,
    bookmark_event_in_db,
    unbookmark_event_in_db,
    register_event_in_db
)
from controllers.auth_controller import get_clerk_id_from_request

async def register_user_profile(user_data: UserCreate) -> UserResponse:
    """
    POST /api/v1/users
    Registers a new user (can be called via Clerk webhook or manual register).
    """
    user_dict = create_user(user_data)
    return UserResponse(**user_dict)


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
        

    
    # Map fields for UserPublic
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
    clerk_id = get_clerk_id_from_request(request)
    updated_user = bookmark_event_in_db(clerk_id, event_id)
    return UserResponse(**updated_user)


async def unbookmark_event(request: Request, event_id: str) -> UserResponse:
    """
    DELETE /api/v1/users/bookmark/{event_id}
    Removes an event from the authenticated user's bookmarks.
    """
    clerk_id = get_clerk_id_from_request(request)
    updated_user = unbookmark_event_in_db(clerk_id, event_id)
    return UserResponse(**updated_user)


async def register_event(request: Request, event_id: str) -> UserResponse:
    """
    POST /api/v1/users/register/{event_id}
    Registers the authenticated user for an event.
    """
    clerk_id = get_clerk_id_from_request(request)
    updated_user = register_event_in_db(clerk_id, event_id)
    return UserResponse(**updated_user)
