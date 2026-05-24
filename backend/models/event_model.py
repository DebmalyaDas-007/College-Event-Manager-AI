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
    lat:     float      = Field(..., ge=-90,  le=90)
    lng:     float      = Field(..., ge=-180, le=180)
    city:    str        = Field(..., max_length=100)
    state:   str | None = Field(default=None, max_length=100)
    country: str        = Field(default="India", max_length=100)


# ---------------------------------------------------------------------------
# Event schemas
# ---------------------------------------------------------------------------

class EventBase(MongoBase):
    title:                 str            = Field(..., min_length=3, max_length=200)
    description:           str            = Field(..., min_length=10, max_length=5000)
    category:              EventCategory
    tags:                  list[str]      = Field(default_factory=list, max_length=15)
    venue:                 str            = Field(..., max_length=300)
    location:              EventLocation
    college:               str            = Field(..., max_length=200)
    is_intercollege:       bool           = False
    start_date:            datetime
    end_date:              datetime
    registration_link:     str | None     = None
    registration_deadline: datetime | None = None
    max_participants:      int | None     = Field(default=None, ge=1)
    coins_reward:          int            = Field(default=0, ge=0)
    points_reward:         int            = Field(default=0, ge=0)
    image_urls:            list[str]      = Field(default_factory=list, max_length=10)
    is_premium_only:       bool           = False

    @model_validator(mode="after")
    def validate_dates(self) -> EventBase:
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
    organizer_id:   str          = Field(..., min_length=1)
    organizer_type: OrganizerType = OrganizerType.CLUB


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