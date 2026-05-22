from fastapi import APIRouter, Depends

from controllers.auth_controller import (
    get_current_user,
    update_profile
)

from middleware.auth_middleware import (
    verify_clerk_token
)

router = APIRouter()

router.get(
    "/me",
    dependencies=[Depends(verify_clerk_token)]
)(get_current_user)

router.put(
    "/profile",
    dependencies=[Depends(verify_clerk_token)]
)(update_profile)