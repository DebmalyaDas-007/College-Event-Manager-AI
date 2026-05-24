"""
Nexus AI — User Routes
File: routes/user_routes.py
"""

from fastapi import APIRouter, Depends
from middleware.auth_middleware import verify_clerk_token
from controllers.user_controller import (
    register_user_profile,
    get_public_profile,
    bookmark_event,
    unbookmark_event,
    register_event
)

router = APIRouter()

router.post(
    "/",
)(register_user_profile)

router.get(
    "/{user_id}",
)(get_public_profile)

router.post(
    "/bookmark/{event_id}",
    dependencies=[Depends(verify_clerk_token)]
)(bookmark_event)

router.delete(
    "/bookmark/{event_id}",
    dependencies=[Depends(verify_clerk_token)]
)(unbookmark_event)

router.post(
    "/register/{event_id}",
    dependencies=[Depends(verify_clerk_token)]
)(register_event)
