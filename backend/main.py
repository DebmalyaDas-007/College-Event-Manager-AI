from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth_routes import router as auth_router
from routes.event_routes import router as event_router
from routes.upload_routes import router as upload_router
from routes.user_routes import router as user_router
from routes.admin_routes import router as admin_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

app.include_router(
    user_router,
    prefix="/api/v1/users",
    tags=["Users"]
)

app.include_router(
    admin_router,
    prefix="/api/v1/admin",
    tags=["Admins"]
)

app.include_router(
    event_router,
    prefix="/api/v1/events",
    tags=["Events"]
)

app.include_router(
    upload_router,
    prefix="/api/v1/upload",
    tags=["Uploads"]
)

@app.get("/")
async def home():
    return {
        "message": "Backend Running"
    }