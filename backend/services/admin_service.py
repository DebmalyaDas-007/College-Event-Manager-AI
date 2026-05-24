"""
Nexus AI — Admin / Organizer Service
File: services/admin_service.py
"""

from datetime import datetime
from bson import ObjectId
from database.db import admin_collection, serialize_doc
from models.admin_model import AdminCreate, AdminUpdate, AdminPermission

def create_admin(admin_data: AdminCreate) -> dict:
    """
    Creates a new admin/organizer in the system.
    Triggers pydantic validation and maps initial attributes.
    """
    existing = admin_collection.find_one({"clerk_id": admin_data.clerk_id})
    if existing:
        return serialize_doc(existing)
        
    admin_dict = admin_data.model_dump()
    admin_dict["is_active"] = True
    admin_dict["is_verified"] = False
    admin_dict["last_login"] = None
    admin_dict["created_at"] = datetime.utcnow()
    admin_dict["updated_at"] = datetime.utcnow()
    
    result = admin_collection.insert_one(admin_dict)
    admin_dict["_id"] = str(result.inserted_id)
    return admin_dict


def get_admin_by_clerk_id(clerk_id: str) -> dict | None:
    """
    Fetches an admin/organizer by their clerk_id.
    """
    admin = admin_collection.find_one({"clerk_id": clerk_id})
    return serialize_doc(admin) if admin else None


def get_admin_by_id(admin_id: str) -> dict | None:
    """
    Fetches an admin/organizer by their MongoDB ID.
    """
    try:
        admin = admin_collection.find_one({"_id": ObjectId(admin_id)})
        return serialize_doc(admin) if admin else None
    except Exception:
        return None


def update_admin_profile(clerk_id: str, admin_data: AdminUpdate) -> dict | None:
    """
    Updates an admin's profile parameters.
    """
    admin = admin_collection.find_one({"clerk_id": clerk_id})
    if not admin:
        return None
        
    update_data = admin_data.model_dump(exclude_unset=True)
    if not update_data:
        return serialize_doc(admin)
        
    update_data["updated_at"] = datetime.utcnow()
    
    admin_collection.update_one(
        {"clerk_id": clerk_id},
        {"$set": update_data}
    )
    
    updated_admin = admin_collection.find_one({"clerk_id": clerk_id})
    return serialize_doc(updated_admin)


def list_organizers_by_college(college: str) -> list[dict]:
    """
    Lists all organizers belonging to a specific college.
    """
    cursor = admin_collection.find({
        "$or": [
            {"managed_college_id": college},
            {"club_profile.college": college}
        ]
    })
    return [serialize_doc(doc) for doc in cursor]


def update_admin_permissions(admin_id: str, permissions: list[AdminPermission]) -> dict | None:
    """
    Updates permissions for a specific organizer (requires privileged role).
    """
    try:
        obj_id = ObjectId(admin_id)
    except Exception:
        return None
        
    admin_collection.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "permissions": [p.value for p in permissions],
                "updated_at": datetime.utcnow()
            }
        }
    )
    updated_admin = admin_collection.find_one({"_id": obj_id})
    return serialize_doc(updated_admin) if updated_admin else None
