import datetime
from database.db import event_collection
from models.event_model import EventCreate

def create_event_in_db(event_data: EventCreate, user_id: str):
    event_dict = event_data.model_dump()
    event_dict["created_by"] = user_id
    # We use datetime.datetime.now(datetime.UTC) for modern Python or datetime.datetime.utcnow() 
    # but to be completely safe across python versions we'll just use standard UTC now
    event_dict["created_at"] = datetime.datetime.now(datetime.timezone.utc)
    
    result = event_collection.insert_one(event_dict)
    event_dict["_id"] = str(result.inserted_id)
    return event_dict

def get_events_by_organizer(user_id: str):
    cursor = event_collection.find({"created_by": user_id})
    events = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        # convert datetimes to string for JSON serialization
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
        # convert datetimes to string for JSON serialization
        for k, v in doc.items():
            if isinstance(v, datetime.datetime):
                doc[k] = v.isoformat()
        events.append(doc)
    return events
