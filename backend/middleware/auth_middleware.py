from fastapi import Request, HTTPException
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import (
    AuthenticateRequestOptions
)

from config.settings import (
    CLERK_SECRET_KEY
)

clerk_sdk = Clerk(
    bearer_auth=CLERK_SECRET_KEY
)

async def verify_clerk_token(
    request: Request
):

    request_state = clerk_sdk.authenticate_request(
        request,
        AuthenticateRequestOptions(
            authorized_parties=[
                "http://localhost:5173"
            ]
        )
    )

    if not request_state.is_signed_in:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    request.state.user = request_state.payload

    return request_state.payload