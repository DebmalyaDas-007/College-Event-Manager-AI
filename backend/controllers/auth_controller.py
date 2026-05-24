"""
Nexus AI — Auth / Me Controller
File: controllers/auth_controller.py
"""

from fastapi import Request, HTTPException, status
from models.user_model import UserResponse, UserProfileUpdate
from services.user_service import get_or_create_user, update_user_profile

def get_clerk_id_from_request(request: Request) -> str:
    """
    Extracts the Clerk user ID (sub claim) from the authenticated request state.
    """
    if not hasattr(request.state, "user") or not request.state.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated in request state"
        )
    
    payload = request.state.user
    if isinstance(payload, dict):
        clerk_id = payload.get("sub")
    else:
        clerk_id = getattr(payload, "sub", None)
        
    if not clerk_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Clerk ID (sub) not found in authentication token"
        )
        
    return clerk_id


async def get_current_user(request: Request) -> UserResponse:
    """
    GET /api/v1/auth/me
    Retrieves the currently authenticated user profile.
    Auto-creates profile if it doesn't exist yet.
    """
    clerk_id = get_clerk_id_from_request(request)
    user_dict = get_or_create_user(clerk_id)
    return UserResponse(**user_dict)


async def update_profile(request: Request, profile_data: UserProfileUpdate) -> UserResponse:
    """
    PUT /api/v1/auth/profile
    Updates the authenticated user profile details.
    """
    clerk_id = get_clerk_id_from_request(request)
    updated_user = update_user_profile(clerk_id, profile_data)
    return UserResponse(**updated_user)
