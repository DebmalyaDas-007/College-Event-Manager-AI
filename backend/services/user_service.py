"""
Nexus AI — User Service
File: services/user_service.py
"""

from datetime import datetime
from database.db import user_collection, serialize_doc
from models.user_model import UserCreate, UserProfileUpdate
from middleware.auth_middleware import clerk_sdk

def get_or_create_user(clerk_id: str) -> dict:
    """
    Fetches the user from database by clerk_id.
    If the user does not exist, fetches basic information from Clerk
    and auto-creates the user database document.
    """
    user = user_collection.find_one({"clerk_id": clerk_id})
    if not user:
        # Fetch from Clerk to populate default name, email, avatar
        name = "New User"
        email = f"{clerk_id}@clerk.local"
        avatar = None
        
        try:
            clerk_user = clerk_sdk.users.get(user_id=clerk_id)
            if clerk_user:
                first_name = clerk_user.first_name or ""
                last_name = clerk_user.last_name or ""
                name = f"{first_name} {last_name}".strip() or "New User"
                if clerk_user.email_addresses:
                    email = clerk_user.email_addresses[0].email_address
                avatar = clerk_user.image_url
        except Exception:
            pass  # Fallback to defaults if clerk_sdk API fails or offline

        user_dict = {
            "clerk_id": clerk_id,
            "name": name,
            "email": email,
            "avatar": avatar,
            "college": "Not Specified",
            "department": None,
            "year_of_study": None,
            "interests": [],
            "skills": [],
            "resume_url": None,
            "location": None,
            "role": "student",
            "gamification": {
                "coins": 0,
                "total_points": 0,
                "level": 1,
                "badges": []
            },
            "bookmarked_events": [],
            "registered_events": [],
            "is_premium": False,
            "stripe_customer_id": None,
            "premium_until": None,
            "is_verified": False,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = user_collection.insert_one(user_dict)
        user_dict["_id"] = str(result.inserted_id)
        return user_dict
    else:
        return serialize_doc(user)


def create_user(user_data: UserCreate) -> dict:
    """
    Creates a new user profile based on a UserCreate schema (e.g. from a Webhook).
    """
    # Check if user already exists
    existing = user_collection.find_one({"clerk_id": user_data.clerk_id})
    if existing:
        return serialize_doc(existing)
        
    user_dict = user_data.model_dump()
    user_dict["role"] = "student"
    user_dict["gamification"] = {
        "coins": 0,
        "total_points": 0,
        "level": 1,
        "badges": []
    }
    user_dict["bookmarked_events"] = []
    user_dict["registered_events"] = []
    user_dict["is_premium"] = False
    user_dict["stripe_customer_id"] = None
    user_dict["premium_until"] = None
    user_dict["is_verified"] = False
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    
    result = user_collection.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    return user_dict


def update_user_profile(clerk_id: str, profile_data: UserProfileUpdate) -> dict:
    """
    Updates an existing user's profile with set patch parameters.
    """
    # Ensure user exists first
    user = get_or_create_user(clerk_id)
    
    update_data = profile_data.model_dump(exclude_unset=True)
    if not update_data:
        return user
        
    update_data["updated_at"] = datetime.utcnow()
    
    # Flatten embedded Location if it is updated as a whole dictionary
    # or handle normally as Pydantic models validate nested dicts.
    user_collection.update_one(
        {"clerk_id": clerk_id},
        {"$set": update_data}
    )
    
    updated_user = user_collection.find_one({"clerk_id": clerk_id})
    return serialize_doc(updated_user)


def bookmark_event_in_db(clerk_id: str, event_id: str) -> dict:
    """
    Bookmarks an event for a user.
    """
    get_or_create_user(clerk_id)  # Ensure user document exists
    user_collection.update_one(
        {"clerk_id": clerk_id},
        {
            "$addToSet": {"bookmarked_events": event_id},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    updated_user = user_collection.find_one({"clerk_id": clerk_id})
    return serialize_doc(updated_user)


def unbookmark_event_in_db(clerk_id: str, event_id: str) -> dict:
    """
    Removes a bookmark for an event.
    """
    get_or_create_user(clerk_id)  # Ensure user document exists
    user_collection.update_one(
        {"clerk_id": clerk_id},
        {
            "$pull": {"bookmarked_events": event_id},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    updated_user = user_collection.find_one({"clerk_id": clerk_id})
    return serialize_doc(updated_user)


def register_event_in_db(clerk_id: str, event_id: str) -> dict:
    """
    Registers the user for an event.
    """
    get_or_create_user(clerk_id)  # Ensure user document exists
    user_collection.update_one(
        {"clerk_id": clerk_id},
        {
            "$addToSet": {"registered_events": event_id},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    updated_user = user_collection.find_one({"clerk_id": clerk_id})
    return serialize_doc(updated_user)
