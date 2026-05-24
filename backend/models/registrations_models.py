"""
Nexus AI — Registration Model
File: models/registration_model.py
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

class RegistrationStatus(str, Enum):
    PENDING     = "pending"       # submitted, awaiting confirmation
    CONFIRMED   = "confirmed"     # organizer confirmed
    WAITLISTED  = "waitlisted"    # event full, on waitlist
    CANCELLED   = "cancelled"     # user cancelled
    ATTENDED    = "attended"      # physically checked in
    NO_SHOW     = "no_show"       # confirmed but didn't attend


class PaymentStatus(str, Enum):
    NOT_REQUIRED = "not_required"  # free event
    PENDING      = "pending"
    PAID         = "paid"
    REFUNDED     = "refunded"
    FAILED       = "failed"


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class TeamMember(MongoBase):
    """For team-based event registrations."""
    name:    str      = Field(..., min_length=2, max_length=100)
    email:   str      = Field(..., max_length=200)
    college: str      = Field(..., max_length=200)
    role:    str | None = Field(default=None, max_length=100)  # team lead, member etc


class PaymentDetails(MongoBase):
    status:             PaymentStatus = PaymentStatus.NOT_REQUIRED
    amount:             float | None  = Field(default=None, ge=0)
    currency:           str           = Field(default="INR", max_length=10)
    stripe_payment_id:  str | None    = None
    paid_at:            datetime | None = None
    refunded_at:        datetime | None = None


# ---------------------------------------------------------------------------
# Registration schemas
# ---------------------------------------------------------------------------

class RegistrationBase(MongoBase):
    user_id:    str = Field(..., min_length=1)
    event_id:   str = Field(..., min_length=1)

    # Team events
    is_team_registration: bool            = False
    team_name:            str | None      = Field(default=None, max_length=100)
    team_members:         list[TeamMember] = Field(default_factory=list)

    # Payment
    payment:              PaymentDetails  = Field(default_factory=PaymentDetails)

    # Extra info collected at registration time
    answers:              dict[str, str]  = Field(default_factory=dict)  # custom form Q&A

    @model_validator(mode="after")
    def team_name_required_if_team(self) -> RegistrationBase:
        if self.is_team_registration and not self.team_name:
            raise ValueError("team_name is required for team registrations")
        return self


class RegistrationCreate(RegistrationBase):
    """POST /registrations — called when student registers for an event."""
    pass


class RegistrationUpdate(MongoBase):
    """PATCH /registrations/{id} — organizer or system updates."""
    status:       RegistrationStatus | None = None
    attended:     bool | None               = None
    checked_in_at: datetime | None          = None
    payment:      PaymentDetails | None     = None
    coins_earned: int | None               = Field(default=None, ge=0)
    points_earned: int | None              = Field(default=None, ge=0)


class RegistrationInDB(RegistrationBase):
    """Full MongoDB document."""
    id:            PyObjectId          = Field(alias="_id")
    status:        RegistrationStatus  = RegistrationStatus.PENDING
    attended:      bool                = False
    checked_in_at: datetime | None     = None
    coins_earned:  int                 = Field(default=0, ge=0)
    points_earned: int                 = Field(default=0, ge=0)
    registered_at: datetime            = Field(default_factory=datetime.utcnow)
    updated_at:    datetime            = Field(default_factory=datetime.utcnow)


class RegistrationResponse(MongoBase):
    """Returned from API."""
    id:                   PyObjectId         = Field(alias="_id")
    user_id:              str
    event_id:             str
    status:               RegistrationStatus
    is_team_registration: bool
    team_name:            str | None
    team_members:         list[TeamMember]
    payment:              PaymentDetails
    attended:             bool
    checked_in_at:        datetime | None
    coins_earned:         int
    points_earned:        int
    registered_at:        datetime


class RegistrationListItem(MongoBase):
    """Lightweight view for organizer dashboard tables."""
    id:            PyObjectId         = Field(alias="_id")
    user_id:       str
    event_id:      str
    status:        RegistrationStatus
    team_name:     str | None
    attended:      bool
    payment_status: PaymentStatus
    registered_at: datetime


class CheckInPayload(MongoBase):
    """POST /registrations/{id}/checkin — QR scan or manual check-in."""
    registration_id: str
    checked_in_by:   str       # admin_id or organizer_id
    checked_in_at:   datetime  = Field(default_factory=datetime.utcnow)
    method:          str       = Field(default="manual")  # manual / qr_scan / nfc