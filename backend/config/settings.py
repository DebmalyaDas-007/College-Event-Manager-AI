from dotenv import load_dotenv
import os

load_dotenv()

CLERK_SECRET_KEY = os.getenv(
    "CLERK_SECRET_KEY"
)

DATABASE_URL = os.getenv(
    "MONGO_URI"
)
CLOUD_NAME = os.getenv(
    "CLOUD_NAME"
)
CLOUD_API_KEY = os.getenv(
    "CLOUD_API_KEY"
)
CLOUD_API_SECRET = os.getenv(
    "CLOUD_API_SECRET"
)
