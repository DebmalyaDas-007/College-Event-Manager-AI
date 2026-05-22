from fastapi import Request, HTTPException, status
from services.user_service import get_or_create_user, update_user_profile
from models.user_model import UserProfileUpdate

async def get_current_user(request: Request):
    try:
        user_id = request.state.user.get("sub")
        db_user = get_or_create_user(user_id)
        
        return {
            "success": True,
            "user": request.state.user,
            "profile": db_user
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def update_profile(request: Request, profile_data: UserProfileUpdate):
    try:
        user_id = request.state.user.get("sub")
        updated_user = update_user_profile(user_id, profile_data)
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "profile": updated_user
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))