from fastapi import APIRouter, Depends
from middleware.auth_middleware import verify_clerk_token
from controllers.user_controller import (
    register_user_profile,
    update_user_profile_handler, # <-- Add this controller import
    get_public_profile,
    bookmark_event,
    unbookmark_event,
    register_event
)

router = APIRouter()

# Webhook or Initial manual creation
router.post(
    "/",
)(register_user_profile)

# 🛠️ FIX: Add the missing profile update route with authentication!
router.patch(
    "/me",
    dependencies=[Depends(verify_clerk_token)]
)(update_user_profile_handler)

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