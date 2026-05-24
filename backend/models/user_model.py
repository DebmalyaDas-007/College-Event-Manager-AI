"""
Nexus AI — User Models
File: user_model.py
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Annotated

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

PyObjectId = Annotated[str, Field(default_factory=lambda: str(ObjectId()))]


class MongoBase(BaseModel):
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str,
            datetime: lambda v: v.isoformat(),
        },
    }


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, Enum):
    STUDENT = "student"
    ORGANIZER = "organizer"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class Location(MongoBase):
    city: str = Field(..., max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str = Field(default="India", max_length=100)



# ---------------------------------------------------------------------------
# Base User Schema
# ---------------------------------------------------------------------------

class UserBase(MongoBase):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    avatar: str | None = None

    college: str = Field(..., max_length=200)
    department: str | None = Field(default=None, max_length=100)

    year_of_study: int | None = Field(default=None, ge=1, le=6)

    interests: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)

    resume_url: str | None = None

    location: Location | None = None

    # Additional academic, personal and social fields from frontend Profile
    cgpa: float | None = None
    address: str | None = None
    tenth_percentage: float | None = None
    twelfth_percentage: float | None = None
    hobbies: list[str] = Field(default_factory=list)
    github_url: str | None = None
    linkedin_url: str | None = None
    is_profile_complete: bool = False


# ---------------------------------------------------------------------------
# Create User
# ---------------------------------------------------------------------------

class UserCreate(UserBase):
    """
    POST /users
    Called from Clerk webhook during signup
    """

    clerk_id: str = Field(..., min_length=1)


# ---------------------------------------------------------------------------
# Update User Profile
# ---------------------------------------------------------------------------

class UserProfileUpdate(MongoBase):
    """
    PATCH /users/me
    All fields optional
    """

    name: str | None = Field(default=None, min_length=2, max_length=100)

    avatar: str | None = None

    college: str | None = Field(default=None, max_length=200)

    department: str | None = Field(default=None, max_length=100)

    year_of_study: int | None = Field(default=None, ge=1, le=6)

    interests: list[str] | None = None

    skills: list[str] | None = None

    resume_url: str | None = None

    location: Location | None = None

    # Additional academic, personal and social fields from frontend Profile
    cgpa: float | None = None
    address: str | None = None
    tenth_percentage: float | None = None
    twelfth_percentage: float | None = None
    hobbies: list[str] | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    is_profile_complete: bool | None = None


# ---------------------------------------------------------------------------
# MongoDB Model
# ---------------------------------------------------------------------------

class UserInDB(UserBase):
    """
    Full MongoDB document
    Never returned directly over API
    """

    id: PyObjectId = Field(alias="_id")

    clerk_id: str

    role: UserRole = UserRole.STUDENT

    bookmarked_events: list[str] = Field(default_factory=list)

    registered_events: list[str] = Field(default_factory=list)

    is_premium: bool = False

    stripe_customer_id: str | None = None

    premium_until: datetime | None = None

    is_verified: bool = False

    is_active: bool = True

    created_at: datetime = Field(default_factory=datetime.utcnow)

    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# Public User View
# ---------------------------------------------------------------------------

class UserPublic(MongoBase):
    """
    Safe public profile shown to other users
    """

    id: PyObjectId = Field(alias="_id")

    name: str

    avatar: str | None

    college: str

    department: str | None


# ---------------------------------------------------------------------------
# Full User Response
# ---------------------------------------------------------------------------

class UserResponse(UserBase):
    """
    GET /users/me
    """

    id: PyObjectId = Field(alias="_id")

    role: UserRole

    bookmarked_events: list[str]

    registered_events: list[str]

    is_premium: bool

    premium_until: datetime | None

    is_verified: bool

    is_active: bool

    created_at: datetime

    updated_at: datetime

