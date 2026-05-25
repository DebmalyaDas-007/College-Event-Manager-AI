from fastapi import APIRouter, Depends

from controllers.event_controller import (
    create_event,
    get_my_events,
    get_all_events
)

from middleware.auth_middleware import (
    verify_clerk_token
)

router = APIRouter()

router.post(
    "/",
    dependencies=[Depends(verify_clerk_token)]
)(create_event)

router.get(
    "/my-events",
    dependencies=[Depends(verify_clerk_token)]
)(get_my_events)

router.get(
    "/",
    dependencies=[Depends(verify_clerk_token)]
)(get_all_events)
