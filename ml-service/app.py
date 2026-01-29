from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from io import BytesIO
from PIL import Image
import base64
import json
import os

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

from inference import predict
from deepseek import api_call

# Initialize FastAPI app
app = FastAPI(title="Plant Disease Detection API", version="1.0.0")

# CORS Configuration - Completely rewritten
FRONTEND_URL = "https://plant-dd.vercel.app"
LOCAL_URLS = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] + LOCAL_URLS,
    allow_credentials=False,  # Changed to False for broader compatibility
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI")
mongo_client = None
chats_db = None

def initialize_database():
    """Initialize MongoDB connection"""
    global mongo_client, chats_db
    
    if chats_db is not None:
        return chats_db
    
    if not MONGO_URI:
        print("⚠️  MONGO_URI not configured. Database features disabled.")
        return None
    
    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        database = mongo_client["plant_disease_db"]
        chats_db = database["chats"]
        
        # Create indexes
        chats_db.create_index([("user_id", 1), ("created_at", -1)])
        chats_db.create_index("id")
        
        print("✅ MongoDB connected successfully")
        return chats_db
    except ServerSelectionTimeoutError as error:
        print(f"❌ MongoDB connection failed: {error}")
        return None

# Pydantic Models
class ImagePredictionRequest(BaseModel):
    image: str

class DeepSeekQueryRequest(BaseModel):
    prompt_data: str

class CreateChatRequest(BaseModel):
    userId: str
    id: str
    title: str
    plant: str
    plantDisplayName: str
    conversation: List[dict]
    filteredPrediction: List[dict]
    imageData: Optional[str] = None
    location: Optional[dict] = None
    timestamp: str

class UpdateChatRequest(BaseModel):
    conversation: List[dict]

# Health Check Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Plant Disease Detection API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/isAlive")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.options("/predict")
async def predict_options():
    """Handle OPTIONS request for /predict"""
    return JSONResponse(content={"status": "ok"})

@app.options("/deepseek")
async def deepseek_options():
    """Handle OPTIONS request for /deepseek"""
    return JSONResponse(content={"status": "ok"})

# Prediction Endpoint
@app.post("/predict")
async def make_prediction(request: ImagePredictionRequest):
    """Analyze plant leaf image and predict diseases"""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(request.image)
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception as error:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid image data: {str(error)}"
        )
    
    # Get model path
    model_path = os.path.join(os.getcwd(), "model", "18_Epoch.pth")
    
    if not os.path.exists(model_path):
        raise HTTPException(
            status_code=500, 
            detail="Model file not found"
        )
    
    # Run prediction
    try:
        predictions = predict(model_path, image)
        return predictions
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )

# DeepSeek AI Endpoint
@app.post("/deepseek")
async def query_deepseek(request: DeepSeekQueryRequest):
    """Query DeepSeek AI for plant disease analysis"""
    try:
        context = json.loads(request.prompt_data)
        result = api_call(json.dumps(context))
        
        # Return parsed JSON if possible
        if isinstance(result, str):
            try:
                return json.loads(result)
            except:
                return {"response": result}
        return result
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"DeepSeek query failed: {str(error)}"
        )

# Chat Management Endpoints
@app.post("/chats")
async def create_new_chat(chat: CreateChatRequest):
    """Create a new chat session"""
    collection = initialize_database()
    
    if collection is None:
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable"
        )
    
    # Prepare document
    chat_document = {
        "id": chat.id,
        "user_id": chat.userId,
        "title": chat.title,
        "plant": chat.plant,
        "plant_display_name": chat.plantDisplayName,
        "conversation": chat.conversation,
        "filtered_prediction": chat.filteredPrediction,
        "image_data": chat.imageData,
        "location": chat.location,
        "timestamp": chat.timestamp,
        "created_at": datetime.utcnow(),
    }
    
    try:
        collection.insert_one(chat_document)
        return chat_document
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create chat: {str(error)}"
        )

@app.get("/chats/{user_id}")
async def get_user_chats(user_id: str):
    """Retrieve all chats for a specific user"""
    collection = initialize_database()
    
    if collection is None:
        return []
    
    try:
        chats = list(collection.find({"user_id": user_id}).sort("created_at", -1))
        return chats
    except Exception as error:
        print(f"Error fetching chats: {error}")
        return []

@app.put("/chats/{chat_id}")
async def update_existing_chat(chat_id: str, chat: UpdateChatRequest):
    """Update conversation in existing chat"""
    collection = initialize_database()
    
    if collection is None:
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable"
        )
    
    try:
        result = collection.update_one(
            {"id": chat_id},
            {"$set": {"conversation": chat.conversation}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Chat not found"
            )
        
        return {"success": True, "updated": True}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update chat: {str(error)}"
        )

@app.delete("/chats/{chat_id}")
async def delete_existing_chat(chat_id: str):
    """Delete a chat session"""
    collection = initialize_database()
    
    if collection is None:
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable"
        )
    
    try:
        result = collection.delete_one({"id": chat_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Chat not found"
            )
        
        return {"success": True, "deleted": True}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete chat: {str(error)}"
        )

# Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    print(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
