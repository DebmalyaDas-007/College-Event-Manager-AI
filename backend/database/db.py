from pymongo import MongoClient
from config.settings import (
    DATABASE_URL
)

client = MongoClient(DATABASE_URL)


# DATABASE

db = client["campus_event_ai"]


# COLLECTIONS

event_collection = db["events"]

user_collection = db["users"]
