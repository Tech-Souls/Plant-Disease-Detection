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
app = FastAPI(title="Plant Disease Detection API")

# Add CORS middleware - Use FastAPI's built-in middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://plant-dd.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight for 10 minutes
)

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI")
mongo_client = None
chats_db = None

def get_database():
    """Get MongoDB database connection"""
    global mongo_client, chats_db
    
    if chats_db:
        return chats_db
    
    if not MONGO_URI:
        print("⚠️  MONGO_URI not set")
        return None
    
    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        database = mongo_client["plant_disease_db"]
        chats_db = database["chats"]
        chats_db.create_index([("user_id", 1), ("created_at", -1)])
        chats_db.create_index("id")
        print("✅ MongoDB connected")
        return chats_db
    except Exception as e:
        print(f"❌ MongoDB error: {e}")
        return None

# Models
class ImageRequest(BaseModel):
    image: str

class DeepSeekRequest(BaseModel):
    prompt_data: str

class ChatCreate(BaseModel):
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

class ChatUpdate(BaseModel):
    conversation: List[dict]

# Endpoints
@app.get("/")
def root():
    return {"service": "Plant Disease Detection API", "status": "running"}

@app.get("/isAlive")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict_disease(req: ImageRequest):
    try:
        img_data = base64.b64decode(req.image)
        img = Image.open(BytesIO(img_data)).convert("RGB")
        
        model_path = os.path.join(os.getcwd(), "model", "18_Epoch.pth")
        if not os.path.exists(model_path):
            raise HTTPException(status_code=500, detail="Model not found")
        
        return predict(model_path, img)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/deepseek")
def deepseek_query(req: DeepSeekRequest):
    try:
        context = json.loads(req.prompt_data)
        result = api_call(json.dumps(context))
        
        if isinstance(result, str):
            try:
                return json.loads(result)
            except:
                return {"response": result}
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chats")
def create_chat(chat: ChatCreate):
    db = get_database()
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    doc = {
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
    
    db.insert_one(doc)
    return doc

@app.get("/chats/{user_id}")
def get_chats(user_id: str):
    db = get_database()
    if not db:
        return []
    
    chats = list(db.find({"user_id": user_id}).sort("created_at", -1))
    return chats

@app.put("/chats/{chat_id}")
def update_chat(chat_id: str, chat: ChatUpdate):
    db = get_database()
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    result = db.update_one({"id": chat_id}, {"$set": {"conversation": chat.conversation}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return {"ok": True}

@app.delete("/chats/{chat_id}")
def delete_chat(chat_id: str):
    db = get_database()
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    result = db.delete_one({"id": chat_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return {"ok": True}

# Optional: Add this if you want to allow all origins (less secure)
# For development/testing only
@app.middleware("http")
async def catch_all_cors(request: Request, call_next):
    response = await call_next(request)
    
    # Only add CORS headers if they're not already set
    if "Access-Control-Allow-Origin" not in response.headers:
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response
