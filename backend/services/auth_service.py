async def format_user_data(user):

    return {
        "id": user.get("sub"),
        "email": user.get("email"),
    }