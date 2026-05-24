"""
Nexus AI — Review Model
File: models/review_model.py
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

class ReviewStatus(str, Enum):
    PENDING   = "pending"    # awaiting moderation
    APPROVED  = "approved"   # visible publicly
    REJECTED  = "rejected"   # removed by admin
    FLAGGED   = "flagged"    # reported by other users


class ReviewAspect(str, Enum):
    """Specific aspects a student can rate separately."""
    ORGANIZATION  = "organization"
    CONTENT       = "content"
    VENUE         = "venue"
    NETWORKING    = "networking"
    OVERALL       = "overall"


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class AspectRating(MongoBase):
    """Per-aspect breakdown rating."""
    aspect: ReviewAspect
    rating: int = Field(..., ge=1, le=5)


class ReviewReport(MongoBase):
    """Captured when another user flags a review."""
    reported_by: str                  # user_id
    reason:      str = Field(..., min_length=5, max_length=300)
    reported_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# Review schemas
# ---------------------------------------------------------------------------

class ReviewBase(MongoBase):
    user_id:        str = Field(..., min_length=1)
    event_id:       str = Field(..., min_length=1)
    rating:         int = Field(..., ge=1, le=5)
    title:          str | None = Field(default=None, max_length=150)
    comment:        str | None = Field(default=None, min_length=10, max_length=1000)
    aspect_ratings: list[AspectRating] = Field(default_factory=list)
    is_anonymous:   bool = False

    @model_validator(mode="after")
    def comment_required_for_low_rating(self) -> ReviewBase:
        if self.rating <= 2 and not self.comment:
            raise ValueError(
                "comment is required when rating is 2 or below"
            )
        return self

    @model_validator(mode="after")
    def no_duplicate_aspects(self) -> ReviewBase:
        aspects = [a.aspect for a in self.aspect_ratings]
        if len(aspects) != len(set(aspects)):
            raise ValueError("duplicate aspect ratings are not allowed")
        return self


class ReviewCreate(ReviewBase):
    """
    POST /reviews
    Only allowed if user has attended the event
    (registration status == attended).
    """
    registration_id: str = Field(..., min_length=1)


class ReviewUpdate(MongoBase):
    """PATCH /reviews/{id} — user can edit their own review."""
    rating:         int | None              = Field(default=None, ge=1, le=5)
    title:          str | None              = Field(default=None, max_length=150)
    comment:        str | None              = Field(default=None, min_length=10, max_length=1000)
    aspect_ratings: list[AspectRating] | None = None
    is_anonymous:   bool | None             = None


class ReviewModerationUpdate(MongoBase):
    """PATCH /reviews/{id}/moderate — admin only."""
    status:         ReviewStatus
    rejection_reason: str | None = Field(default=None, max_length=300)


class ReviewInDB(ReviewBase):
    """Full MongoDB document."""
    id:               PyObjectId       = Field(alias="_id")
    registration_id:  str
    status:           ReviewStatus     = ReviewStatus.PENDING
    rejection_reason: str | None       = None
    helpful_votes:    int              = Field(default=0, ge=0)
    reports:          list[ReviewReport] = Field(default_factory=list)
    edited_at:        datetime | None  = None
    created_at:       datetime         = Field(default_factory=datetime.utcnow)
    updated_at:       datetime         = Field(default_factory=datetime.utcnow)


class ReviewResponse(MongoBase):
    """Returned from API — hides user identity if anonymous."""
    id:             PyObjectId          = Field(alias="_id")
    user_id:        str | None          # None if is_anonymous
    event_id:       str
    rating:         int
    title:          str | None
    comment:        str | None
    aspect_ratings: list[AspectRating]
    status:         ReviewStatus
    helpful_votes:  int
    is_anonymous:   bool
    edited_at:      datetime | None
    created_at:     datetime

    @model_validator(mode="after")
    def mask_user_if_anonymous(self) -> ReviewResponse:
        if self.is_anonymous:
            self.user_id = None
        return self


class ReviewListItem(MongoBase):
    """Lightweight card for event detail page."""
    id:            PyObjectId = Field(alias="_id")
    user_id:       str | None
    rating:        int
    title:         str | None
    comment:       str | None
    helpful_votes: int
    is_anonymous:  bool
    created_at:    datetime


class ReviewHelpfulVote(MongoBase):
    """POST /reviews/{id}/helpful — marks a review as helpful."""
    review_id: str
    user_id:   str
    voted_at:  datetime = Field(default_factory=datetime.utcnow)


class EventReviewSummary(MongoBase):
    """
    Aggregated review stats for an event —
    computed and cached, not stored per-review.
    """
    event_id:        str
    total_reviews:   int   = Field(default=0, ge=0)
    avg_rating:      float = Field(default=0.0, ge=0.0, le=5.0)
    rating_breakdown: dict[int, int] = Field(default_factory=dict)  # {5: 10, 4: 5, ...}
    aspect_averages: dict[str, float] = Field(default_factory=dict) # {organization: 4.2, ...}
    last_updated:    datetime = Field(default_factory=datetime.utcnow)