from pymongo import MongoClient
import certifi
from config.settings import (
    DATABASE_URL
)

client = MongoClient(DATABASE_URL, tlsCAFile=certifi.where())


# DATABASE

db = client["campus_event_ai"]


# COLLECTIONS

event_collection = db["events"]

user_collection = db["users"]

admin_collection = db["admins"]


def serialize_doc(doc):
    if not doc:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

