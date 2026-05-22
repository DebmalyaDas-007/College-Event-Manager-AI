from fastapi import APIRouter, Depends

from controllers.event_controller import (
    create_event
)

from middleware.auth_middleware import (
    verify_clerk_token
)

router = APIRouter()

router.post(
    "/",
    dependencies=[Depends(verify_clerk_token)]
)(create_event)
