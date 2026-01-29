from fastapi import FastAPI, HTTPException, Request
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

# Ultra-permissive CORS middleware - Manual implementation
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    """Add CORS headers to every response"""
    response = await call_next(request)
    
    # Get origin from request
    origin = request.headers.get("origin", "*")
    
    # Add CORS headers
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "false"
    response.headers["Access-Control-Max-Age"] = "3600"
    
    return response

# Handle all OPTIONS requests
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle all OPTIONS preflight requests"""
    return JSONResponse(
        content={"status": "ok"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
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
            raise HTTPException(500, "Model not found")
        
        return predict(model_path, img)
    except Exception as e:
        raise HTTPException(500, str(e))

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
        raise HTTPException(500, str(e))

@app.post("/chats")
def create_chat(chat: ChatCreate):
    db = get_database()
    if not db:
        raise HTTPException(503, "Database unavailable")
    
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
        raise HTTPException(503, "Database unavailable")
    
    result = db.update_one({"id": chat_id}, {"$set": {"conversation": chat.conversation}})
    if result.matched_count == 0:
        raise HTTPException(404, "Chat not found")
    
    return {"ok": True}

@app.delete("/chats/{chat_id}")
def delete_chat(chat_id: str):
    db = get_database()
    if not db:
        raise HTTPException(503, "Database unavailable")
    
    result = db.delete_one({"id": chat_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Chat not found")
    
    return {"ok": True}
