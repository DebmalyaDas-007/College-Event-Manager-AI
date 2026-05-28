from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.ai_engine import get_personalized_recommendations

router = APIRouter()

# Input validator model schema tracking incoming payload data shapes
class RecommendationRequest(BaseModel):
    profile_summary: str = Field(
        ..., 
        example="I am an undergraduate student proficient in full-stack engineering, FastAPI, and C++ for data structures."
    )

@router.post("/recommendations")
async def get_personalized_feed(data: RecommendationRequest):
    """
    Post Request receiving a user descriptive metadata summary string,
    processing vector metrics via RAG, and outputting scored recommendations.
    """
    try:
        recommendation_data = get_personalized_recommendations(data.profile_summary)
        return {
            "status": "success",
            "results": len(recommendation_data.get("feed", [])),
            "data": recommendation_data
        }
    except Exception as e:
        # Fixed the curly smart quote typo at the end of this string
        raise HTTPException(status_code=500, detail=f"AI Personalization Error: {str(e)}")