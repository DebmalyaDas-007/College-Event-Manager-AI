from pydantic import BaseModel
from typing import Optional, List

class UserProfileUpdate(BaseModel):
    interests: Optional[List[str]] = []
    department: Optional[str] = None
    college: Optional[str] = None
    cgpa: Optional[float] = None
    address: Optional[str] = None
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    hobbies: Optional[List[str]] = []
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    skills: Optional[List[str]] = []
    is_profile_complete: Optional[bool] = True
