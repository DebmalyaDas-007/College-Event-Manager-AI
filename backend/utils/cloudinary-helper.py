import cloudinary.uploader
import os

def upload_to_cloudinary(file_path: str, folder: str = "memes"):
    try:
        # Upload the file to Cloudinary
        result = cloudinary.uploader.upload(
            file_path,
            resource_type="auto",
            folder=folder
        )
        
        # Delete the file from your computer/server after upload
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return result

    except Exception as error:
        # If upload fails, still delete the file so it doesn't waste space
        if os.path.exists(file_path):
            os.remove(file_path)
        raise error