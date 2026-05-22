from database.db import user_collection
from models.user_model import UserProfileUpdate

def get_or_create_user(clerk_id: str):
    user = user_collection.find_one({"clerk_id": clerk_id})
    if not user:
        # Create a default empty profile
        user = {
            "clerk_id": clerk_id,
            "interests": [],
            "department": "",
            "college": "",
            "cgpa": None,
            "address": "",
            "tenth_percentage": None,
            "twelfth_percentage": None,
            "hobbies": [],
            "github_url": "",
            "linkedin_url": "",
            "skills": [],
            "is_profile_complete": False
        }
        result = user_collection.insert_one(user)
        user["_id"] = str(result.inserted_id)
    else:
        user["_id"] = str(user["_id"])
    return user

def update_user_profile(clerk_id: str, profile_data: UserProfileUpdate):
    update_data = profile_data.model_dump(exclude_unset=True)
    update_data["is_profile_complete"] = True
    
    user_collection.update_one(
        {"clerk_id": clerk_id},
        {"$set": update_data}
    )
    return get_or_create_user(clerk_id)
