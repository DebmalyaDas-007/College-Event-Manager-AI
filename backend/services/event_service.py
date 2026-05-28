import datetime
from database.db import event_collection
from models.event_model import EventCreate, EventStatus

def create_event_in_db(event_data: EventCreate, user_id: str) -> dict:
    # 1. Dump Pydantic object down to a raw dictionary
    event_dict = event_data.model_dump()
    
    # 2. Assign meta fields for database storage tracking
    event_dict["organizer_id"] = event_data.organizer_id or user_id
    event_dict["organizer_type"] = event_data.organizer_type.value if event_data.organizer_type else "club"
    event_dict["status"] = EventStatus.DRAFT.value
    event_dict["current_participants"] = 0
    event_dict["fomo_score"] = 0.0
    event_dict["created_by"] = user_id
    
    # Use standard UTC timestamping
    now = datetime.datetime.now(datetime.timezone.utc)
    event_dict["created_at"] = now
    event_dict["updated_at"] = now
    
    # 3. Write directly into your MongoDB collection collection
    result = event_collection.insert_one(event_dict)
    
    # 4. Normalize the dictionary schemas into clean string formats for Pydantic mapping
    event_dict["_id"] = str(result.inserted_id)
    
    # Convert all native datetime properties to ISO strings for validation safety
    for key, val in event_dict.items():
        if isinstance(val, datetime.datetime):
            event_dict[key] = val.isoformat()
            
    return event_dict

def get_events_by_organizer(user_id: str):
    cursor = event_collection.find({"created_by": user_id})
    events = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        for k, v in doc.items():
            if isinstance(v, datetime.datetime):
                doc[k] = v.isoformat()
        events.append(doc)
    return events

def get_all_events_from_db():
    cursor = event_collection.find()
    events = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        for k, v in doc.items():
            if isinstance(v, datetime.datetime):
                doc[k] = v.isoformat()
        events.append(doc)
    return events