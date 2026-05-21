from dotenv import load_dotenv
import os

load_dotenv()

CLERK_SECRET_KEY = os.getenv(
    "CLERK_SECRET_KEY"
)