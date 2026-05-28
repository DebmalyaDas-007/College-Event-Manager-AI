import asyncio
from fastapi import APIRouter, BackgroundTasks, status, Body, HTTPException
from pydantic import BaseModel, Field, EmailStr
from app.services.ai_engine import get_personalized_recommendations
from app.services.email_service import send_recommendations_email

router = APIRouter(prefix="/api/v1/recommendations", tags=["Recommendations"])

class SmartFeedRequest(BaseModel):
    email: EmailStr = Field(..., description="The student's verified recipient email address.")
    name: str = Field(..., min_length=1, description="The name of the student participant.")
    profile_summary: str = Field(
        ..., 
        min_length=10, 
        description="A text blob describing the student's branch, skills, and active interests."
    )

# This wrapper function runs entirely in the background thread pool
async def delayed_email_pipeline(email: str, name: str, feed_items: list):
    """Waits for 60 seconds without blocking the server, then dispatches the email."""
    print("⏳ Profile summary captured. Waiting 1 minute before firing automation email...")
    await asyncio.sleep(60)  # Pure, non-blocking asynchronous 1-minute delay
    
    formatted_email_events = []
    for item in feed_items:
        formatted_email_events.append({
            "title": item.get("event_title") or "Campus Event",
            "venue": f"Urgency FOMO Score: {item.get('fomo_score', 0)}/100",
            "description": item.get("personalized_reason") or ""
        })
    
    await send_recommendations_email(
        email_to=email,
        participant_name=name,
        recommended_events=formatted_email_events
    )

@router.post("/feed", status_code=status.HTTP_200_OK)
async def get_personalized_feed_and_schedule_email(
    background_tasks: BackgroundTasks,
    payload: SmartFeedRequest
):
    """
    POST /api/v1/recommendations/feed
    Generates onscreen recommendations instantly, and automatically queues
    a background task to send the summary email exactly 1 minute later.
    """
    try:
        # 1. Fetch from ChromaDB and score via Gemini instantly
        recommendation_data = get_personalized_recommendations(payload.profile_summary)
        feed_items = recommendation_data.get("feed", [])
        
        # 2. Automatically queue the 1-minute delayed email tracking pipeline
        if feed_items:
            background_tasks.add_task(
                delayed_email_pipeline,
                email=str(payload.email),
                name=payload.name,
                feed_items=feed_items
            )
        
        # 3. Respond immediately to the frontend UI screen
        return {
            "status": "success",
            "results": len(feed_items),
            "data": recommendation_data
        }
    except Exception as e:
        print(f"ERROR IN AUTOMATION PIPELINE: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"AI Personalization Error: {str(e)}"
        )