"""
Nexus AI — Event Models
File: models/event_model.py
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Annotated

from bson import ObjectId
from pydantic import BaseModel, Field, model_validator


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

PyObjectId = Annotated[str, Field(default_factory=lambda: str(ObjectId()))]


class MongoBase(BaseModel):
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str, datetime: lambda v: v.isoformat()},
    }


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class EventStatus(str, Enum):
    DRAFT      = "draft"
    PUBLISHED  = "published"
    ONGOING    = "ongoing"
    COMPLETED  = "completed"
    CANCELLED  = "cancelled"


class EventCategory(str, Enum):
    HACKATHON    = "hackathon"
    WORKSHOP     = "workshop"
    SEMINAR      = "seminar"
    CULTURAL     = "cultural"
    SPORTS       = "sports"
    TECH_TALK    = "tech_talk"
    FEST         = "fest"
    COMPETITION  = "competition"
    NETWORKING   = "networking"
    OTHER        = "other"


class OrganizerType(str, Enum):
    CLUB        = "club"
    DEPARTMENT  = "department"
    ADMIN       = "admin"
    EXTERNAL    = "external"


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class EventLocation(MongoBase):
    lat:     float | None = Field(default=None, ge=-90,  le=90)
    lng:     float | None = Field(default=None, ge=-180, le=180)
    city:    str | None   = Field(default=None, max_length=100)
    state:   str | None   = Field(default=None, max_length=100)
    country: str | None   = Field(default="India", max_length=100)



# ---------------------------------------------------------------------------
# Event schemas
# ---------------------------------------------------------------------------

class EventBase(MongoBase):
    title:                 str            = Field(..., min_length=3, max_length=200)
    description:           str            = Field(..., min_length=10, max_length=5000)
    category:              EventCategory
    tags:                  list[str]      = Field(default_factory=list, max_length=15)
    venue:                 str | None     = Field(default=None, max_length=300)
    location:              EventLocation | str | None = None
    college:               str | None     = Field(default=None, max_length=200)
    is_intercollege:       bool           = False
    start_date:            datetime | None = None
    end_date:              datetime | None = None
    registration_link:     str | None     = None
    registration_deadline: datetime | None = None
    max_participants:      int | None     = Field(default=None, ge=1)
    coins_reward:          int            = Field(default=0, ge=0)
    points_reward:         int            = Field(default=0, ge=0)
    image_urls:            list[str]      = Field(default_factory=list, max_length=10)
    is_premium_only:       bool           = False

    @model_validator(mode="before")
    @classmethod
    def preprocess_input(cls, data: any) -> any:
        if not isinstance(data, dict):
            return data
        
        # 1. Map frontend category string to lowercase backend enum
        if "category" in data and isinstance(data["category"], str):
            cat_str = data["category"].lower().replace(" fest", "").replace("_", "").strip()
            # Try to match one of the categories
            for cat in EventCategory:
                if cat.value in cat_str or cat_str in cat.value:
                    data["category"] = cat.value
                    break
            else:
                data["category"] = EventCategory.OTHER.value
                
        # 2. Map max_attendees to max_participants if present
        if "max_attendees" in data and "max_participants" not in data:
            data["max_participants"] = data["max_attendees"]
            
        # 3. Map conducting_college to college if present
        if "conducting_college" in data and "college" not in data:
            data["college"] = data["conducting_college"]
            
        # 4. Handle date to start_date / end_date
        if "date" in data and "start_date" not in data:
            data["start_date"] = data["date"]
            
        # 5. Populate end_date if missing
        if "start_date" in data and data["start_date"] and "end_date" not in data:
            try:
                sd = data["start_date"]
                from dateutil.parser import parse
                from datetime import timedelta, datetime as dt_class
                if isinstance(sd, str):
                    dt = parse(sd)
                elif isinstance(sd, dt_class):
                    dt = sd
                else:
                    dt = None
                
                if dt:
                    data["end_date"] = (dt + timedelta(hours=3)).isoformat()
            except Exception:
                pass
            
        # 6. Map location (which might be a string in frontend) to a default EventLocation
        if "location" in data and isinstance(data["location"], str):
            venue_str = data["location"]
            if "venue" not in data or not data["venue"]:
                data["venue"] = venue_str
            
            data["location"] = {
                "lat": 22.5726,
                "lng": 88.3639,
                "city": "Kolkata",
                "state": "West Bengal",
                "country": "India"
            }
            
        # 7. Map image_url (string) to image_urls (list)
        if "image_url" in data and data["image_url"]:
            if "image_urls" not in data or not data["image_urls"]:
                data["image_urls"] = [data["image_url"]]
                
        return data

    @model_validator(mode="after")
    def validate_dates(self) -> EventBase:
        if self.start_date is None:
            from datetime import datetime as dt_class, timezone
            self.start_date = dt_class.now(timezone.utc)
            
        if self.end_date is None:
            from datetime import timedelta
            self.end_date = self.start_date + timedelta(hours=3)
            
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be after start_date")
            
        if (
            self.registration_deadline
            and self.registration_deadline > self.start_date
        ):
            raise ValueError("registration_deadline must be before start_date")
        return self


class EventCreate(EventBase):
    """POST /events — called by organizer or admin."""
    organizer_id:   str | None   = Field(default=None)
    organizer_type: OrganizerType | None = Field(default=OrganizerType.CLUB)



class EventUpdate(MongoBase):
    """PATCH /events/{id} — all fields optional."""
    title:                 str | None           = Field(default=None, min_length=3, max_length=200)
    description:           str | None           = Field(default=None, min_length=10, max_length=5000)
    category:              EventCategory | None  = None
    tags:                  list[str] | None     = Field(default=None, max_length=15)
    venue:                 str | None           = Field(default=None, max_length=300)
    location:              EventLocation | None  = None
    start_date:            datetime | None      = None
    end_date:              datetime | None      = None
    registration_link:     str | None           = None
    registration_deadline: datetime | None      = None
    max_participants:      int | None           = Field(default=None, ge=1)
    coins_reward:          int | None           = Field(default=None, ge=0)
    points_reward:         int | None           = Field(default=None, ge=0)
    image_urls:            list[str] | None     = Field(default=None, max_length=10)
    status:                EventStatus | None   = None
    is_premium_only:       bool | None          = None


class EventInDB(EventBase):
    """Full MongoDB document."""
    id:                   PyObjectId     = Field(alias="_id")
    organizer_id:         str
    organizer_type:       OrganizerType
    status:               EventStatus    = EventStatus.DRAFT
    current_participants: int            = Field(default=0, ge=0)
    fomo_score:           float          = Field(default=0.0, ge=0.0, le=100.0)
    embedding:            list[float] | None = Field(default=None, exclude=True)
    created_at:           datetime       = Field(default_factory=datetime.utcnow)
    updated_at:           datetime       = Field(default_factory=datetime.utcnow)


class EventResponse(EventBase):
    """Full event returned to API consumers."""
    id:                   PyObjectId    = Field(alias="_id")
    organizer_id:         str
    organizer_type:       OrganizerType
    status:               EventStatus
    current_participants: int
    fomo_score:           float
    created_at:           datetime


class EventListItem(MongoBase):
    """Lightweight card for feed/list views."""
    id:                   PyObjectId    = Field(alias="_id")
    title:                str
    category:             EventCategory
    college:              str
    is_intercollege:      bool
    start_date:           datetime
    venue:                str
    current_participants: int
    max_participants:     int | None
    coins_reward:         int
    fomo_score:           float
    image_urls:           list[str]
    status:               EventStatus


# Aliases — in case any existing service imports these names
EventProfileUpdate = EventUpdate