from fastapi import Request, HTTPException
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
from config.settings import CLERK_SECRET_KEY

clerk_sdk = Clerk(
    bearer_auth=CLERK_SECRET_KEY
)

async def verify_clerk_token(request: Request):
    if request.method == "OPTIONS":
        return None

    # 1. Manually grab the Authorization header
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: No Bearer token found in Authorization header."
        )
    
    # Extract the raw JWT token string
    token = auth_header.split(" ")[1]

    try:
        # 2. Use authenticate_request but pass the explicit header state
        request_state = clerk_sdk.authenticate_request(
            request,
            AuthenticateRequestOptions(
                authorized_parties=[
                    "http://localhost:5173",
                    "http://localhost:5173/"
                ]
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal Auth Error: {str(e)}"
        )

    # 3. Final Fallback: If request parsing failed but token is structurally present,
    # let's verify if the SDK evaluates it as signed in.
    if not request_state.is_signed_in:
        # DEBUG PRINTS (Check your terminal log when you press submit!)
        print("--- CLERK AUTH FAILURE DEBUG ---")
        print(f"Token received length: {len(token)}")
        print(f"Auth Status: {request_state.status}")
        print(f"Auth Reason: {getattr(request_state, 'reason', 'No reason provided')}")
        print("---------------------------------")
        
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Invalid or missing session token."
        )

    request.state.user = request_state.payload
    return request_state.payload