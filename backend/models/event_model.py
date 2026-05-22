from pydantic import BaseModel, HttpUrl
from typing import Optional, List

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    location: str
    category: str
    tags: Optional[List[str]] = []
    max_attendees: Optional[int] = None
    organizing_club: Optional[str] = None
    conducting_college: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    insights: Optional[str] = None
    special_notes: Optional[str] = None
