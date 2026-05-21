from fastapi import Request

async def get_current_user(
    request: Request
):

    return {
        "success": True,
        "user": request.state.user
    }