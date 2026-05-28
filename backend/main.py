from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Existing Application Routes Imports
from routes.auth_routes import router as auth_router
from routes.event_routes import router as event_router
from routes.upload_routes import router as upload_router
from routes.user_routes import router as user_router
from routes.admin_routes import router as admin_router

# AI System Submodule Router Imports
from app.api.v1.endpoints.recommendations import router as recommendations_router
from app.api.v1.endpoints.chat import router as chat_router  # <-- Added Chatbot Router Import


app = FastAPI(title="Nexus AI Engine Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =======================================================
# EXISTING APPLICATION CORE ROUTES
# =======================================================

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

# =======================================================
# AI INTELLIGENCE SYSTEM INSTANTIATION PATHS
# =======================================================

# New AI Recommendation System Route Mounted Here
app.include_router(
    recommendations_router,
    prefix="/api/v1",
    tags=["Recommendations"]
)

# New Conversational RAG Chatbot Assistant Route Mounted Here
app.include_router(
    chat_router,
    prefix="/api/v1",
    tags=["AI Assistant Chatbot"]  # <-- Mounted Chatbot Router Endpoint
)


@app.get("/")
async def home():
    return {
        "status": "success",
        "message": "Nexus AI Core Backend Cluster Running Successfully"
    }