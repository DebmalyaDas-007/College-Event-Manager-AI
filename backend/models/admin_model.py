"""
Nexus AI — Admin / Organizer Model
File: models/admin_model.py
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Annotated

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, model_validator


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

class AdminRole(str, Enum):
    CLUB_ORGANIZER = "club_organizer"       # student club post holder
    FEST_ORGANIZER = "fest_organizer"       # college fest committee
    COLLEGE_ADMIN  = "college_admin"        # faculty / college authority
    PLATFORM_ADMIN = "platform_admin"       # nexus platform staff
    SUPER_ADMIN    = "super_admin"          # full access


class AdminPermission(str, Enum):
    CREATE_EVENTS       = "create_events"
    EDIT_OWN_EVENTS     = "edit_own_events"
    DELETE_OWN_EVENTS   = "delete_own_events"
    APPROVE_EVENTS      = "approve_events"
    REJECT_EVENTS       = "reject_events"
    BAN_USERS           = "ban_users"
    VIEW_ANALYTICS      = "view_analytics"
    VIEW_OWN_ANALYTICS  = "view_own_analytics"
    MANAGE_ORGANIZERS   = "manage_organizers"
    MANAGE_ADMINS       = "manage_admins"
    SEND_NOTIFICATIONS  = "send_notifications"
    EXPORT_DATA         = "export_data"


class ClubType(str, Enum):
    TECHNICAL    = "technical"
    CULTURAL     = "cultural"
    SPORTS       = "sports"
    LITERARY     = "literary"
    SOCIAL       = "social"
    ENTREPRENEURSHIP = "entrepreneurship"
    OTHER        = "other"


class PostType(str, Enum):
    PRESIDENT        = "president"
    VICE_PRESIDENT   = "vice_president"
    SECRETARY        = "secretary"
    TREASURER        = "treasurer"
    EVENT_HEAD       = "event_head"
    TECH_HEAD        = "tech_head"
    DESIGN_HEAD      = "design_head"
    PR_HEAD          = "pr_head"
    MEMBER           = "member"
    FACULTY_ADVISOR  = "faculty_advisor"
    OTHER            = "other"


class SubscriptionTier(str, Enum):
    FREE       = "free"
    PRO        = "pro"
    ENTERPRISE = "enterprise"


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class ClubProfile(MongoBase):
    """Filled in when admin_role is club_organizer or fest_organizer."""
    club_name:        str      = Field(..., min_length=2, max_length=150)
    club_type:        ClubType = ClubType.OTHER
    post_held:        PostType = PostType.MEMBER
    custom_post:      str | None = Field(default=None, max_length=100)  # if post_held = OTHER
    college:          str      = Field(..., max_length=200)
    department:       str | None = Field(default=None, max_length=100)
    year_of_study:    int | None = Field(default=None, ge=1, le=6)
    club_description: str | None = Field(default=None, max_length=500)
    club_logo_url:    str | None = None
    social_links:     dict[str, str] = Field(default_factory=dict)  # instagram, linkedin etc
    member_count:     int | None = Field(default=None, ge=1)


class AdminLoginRecord(MongoBase):
    admin_id:   str
    last_login: datetime   = Field(default_factory=datetime.utcnow)
    ip_address: str | None = None
    user_agent: str | None = None


# ---------------------------------------------------------------------------
# Admin / Organizer schemas
# ---------------------------------------------------------------------------

class AdminBase(MongoBase):
    name:               str                   = Field(..., min_length=2, max_length=100)
    email:              EmailStr
    avatar:             str | None            = None
    contact_phone:      str | None            = Field(default=None, pattern=r"^\+?[0-9]{10,15}$")
    admin_role:         AdminRole             = AdminRole.CLUB_ORGANIZER
    managed_college_id: str | None            = None
    permissions:        list[AdminPermission] = Field(default_factory=list)

    # Organizer identity
    club_profile:       ClubProfile | None    = None
    subscription_tier:  SubscriptionTier      = SubscriptionTier.FREE
    subscription_expiry: datetime | None      = None
    stripe_customer_id: str | None            = None

    # Events managed
    managed_events:     list[str]             = Field(default_factory=list)


class AdminCreate(AdminBase):
    """POST /admin — create a new admin/organizer."""
    clerk_id: str = Field(..., min_length=1)

    @model_validator(mode="after")
    def club_profile_required_for_organizer(self) -> AdminCreate:
        if self.admin_role in (
            AdminRole.CLUB_ORGANIZER,
            AdminRole.FEST_ORGANIZER,
        ) and not self.club_profile:
            raise ValueError(
                "club_profile is required for club_organizer and fest_organizer roles"
            )
        return self

    @model_validator(mode="after")
    def college_required_for_college_admin(self) -> AdminCreate:
        if (
            self.admin_role == AdminRole.COLLEGE_ADMIN
            and not self.managed_college_id
        ):
            raise ValueError(
                "managed_college_id is required for college_admin role"
            )
        return self

    @model_validator(mode="after")
    def set_default_permissions(self) -> AdminCreate:
        if not self.permissions:
            if self.admin_role == AdminRole.CLUB_ORGANIZER:
                self.permissions = [
                    AdminPermission.CREATE_EVENTS,
                    AdminPermission.EDIT_OWN_EVENTS,
                    AdminPermission.DELETE_OWN_EVENTS,
                    AdminPermission.VIEW_OWN_ANALYTICS,
                    AdminPermission.SEND_NOTIFICATIONS,
                ]
            elif self.admin_role == AdminRole.FEST_ORGANIZER:
                self.permissions = [
                    AdminPermission.CREATE_EVENTS,
                    AdminPermission.EDIT_OWN_EVENTS,
                    AdminPermission.DELETE_OWN_EVENTS,
                    AdminPermission.VIEW_OWN_ANALYTICS,
                    AdminPermission.VIEW_ANALYTICS,
                    AdminPermission.SEND_NOTIFICATIONS,
                    AdminPermission.EXPORT_DATA,
                ]
            elif self.admin_role == AdminRole.COLLEGE_ADMIN:
                self.permissions = [
                    AdminPermission.CREATE_EVENTS,
                    AdminPermission.EDIT_OWN_EVENTS,
                    AdminPermission.APPROVE_EVENTS,
                    AdminPermission.REJECT_EVENTS,
                    AdminPermission.VIEW_ANALYTICS,
                    AdminPermission.SEND_NOTIFICATIONS,
                    AdminPermission.EXPORT_DATA,
                ]
            elif self.admin_role == AdminRole.PLATFORM_ADMIN:
                self.permissions = [
                    AdminPermission.APPROVE_EVENTS,
                    AdminPermission.REJECT_EVENTS,
                    AdminPermission.BAN_USERS,
                    AdminPermission.VIEW_ANALYTICS,
                    AdminPermission.MANAGE_ORGANIZERS,
                    AdminPermission.SEND_NOTIFICATIONS,
                    AdminPermission.EXPORT_DATA,
                ]
            elif self.admin_role == AdminRole.SUPER_ADMIN:
                self.permissions = list(AdminPermission)
        return self


class AdminUpdate(MongoBase):
    """PATCH /admin/{id} — all fields optional."""
    name:                str | None                  = Field(default=None, min_length=2, max_length=100)
    avatar:              str | None                  = None
    contact_phone:       str | None                  = Field(default=None, pattern=r"^\+?[0-9]{10,15}$")
    admin_role:          AdminRole | None             = None
    managed_college_id:  str | None                  = None
    permissions:         list[AdminPermission] | None = None
    club_profile:        ClubProfile | None           = None
    subscription_tier:   SubscriptionTier | None      = None
    subscription_expiry: datetime | None              = None
    is_active:           bool | None                 = None


class AdminInDB(AdminBase):
    """Full MongoDB document."""
    id:          PyObjectId      = Field(alias="_id")
    clerk_id:    str
    is_active:   bool            = True
    is_verified: bool            = False
    last_login:  datetime | None = None
    created_at:  datetime        = Field(default_factory=datetime.utcnow)
    updated_at:  datetime        = Field(default_factory=datetime.utcnow)


class AdminResponse(AdminBase):
    """Returned from API — clerk_id and stripe_customer_id never exposed."""
    id:          PyObjectId      = Field(alias="_id")
    is_active:   bool
    is_verified: bool
    last_login:  datetime | None
    created_at:  datetime 