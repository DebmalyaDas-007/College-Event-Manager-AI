from fastapi import APIRouter, Depends

from controllers.auth_controller import (
    get_current_user
)

from middleware.auth_middleware import (
    verify_clerk_token
)

router = APIRouter()

router.get(
    "/me",
    dependencies=[Depends(
        verify_clerk_token
    )]
)(get_current_user)