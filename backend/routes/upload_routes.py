import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from config.settings import (
    CLOUD_NAME,
    CLOUD_API_KEY,
    CLOUD_API_SECRET
)
from middleware.auth_middleware import verify_clerk_token

cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=CLOUD_API_KEY,
    api_secret=CLOUD_API_SECRET
)

router = APIRouter()

@router.post(
    "/image",
    dependencies=[Depends(verify_clerk_token)]
)
async def upload_image(file: UploadFile = File(...)):
    try:
        # Read the file contents and upload to cloudinary
        result = cloudinary.uploader.upload(file.file)
        return {
            "success": True,
            "url": result.get("secure_url")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
