from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
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

# CRITICAL: Railway-specific CORS fix
# Railway strips headers, so we need to be aggressive

ALLOWED_ORIGINS = [
    "*"
]

# Railway Fix #1: Early CORS middleware (BEFORE Railway's proxy processes it)
@app.middleware("http")
async def railway_cors_fix(request: Request, call_next):
    """
    Railway-specific CORS fix - runs BEFORE Railway's proxy layer
    This is critical because Railway strips standard CORS headers
    """
    
    # Get the origin from the request
    origin = request.headers.get("origin", "")
    
    # For OPTIONS requests, return immediately with CORS headers
    if request.method == "OPTIONS":
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0],
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With, X-Request-ID",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
                "Content-Type": "application/json",
                "Content-Length": "0",
            }
        )
    
    # Process the request
    response = await call_next(request)
    
    # Add CORS headers to EVERY response (Railway needs this)
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        response.headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGINS[0]
    
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With, X-Request-ID"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Expose-Headers"] = "*"
    response.headers["Vary"] = "Origin"
    
    return response

# Railway Fix #2: Standard CORS middleware (defense in depth)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# MongoDB Configuration (same as before)
MONGO_URI = os.getenv("MONGO_URI")
mongo_client = None
chats_db = None

def get_database():
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

# Models (same as before)
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

# Endpoints (same as before, but with explicit CORS headers on errors)
@app.get("/")
def root():
    return {"service": "Plant Disease Detection API", "status": "running", "cors": "enabled"}

@app.get("/isAlive")
def health():
    return {"status": "ok", "cors": "enabled"}

@app.post("/predict")
async def predict_disease(req: ImageRequest):
    try:
        img_data = base64.b64decode(req.image)
        img = Image.open(BytesIO(img_data)).convert("RGB")
        
        model_path = os.path.join(os.getcwd(), "model", "18_Epoch.pth")
        if not os.path.exists(model_path):
            raise HTTPException(status_code=500, detail="Model not found")
        
        result = predict(model_path, img)
        return result
    except Exception as e:
        print(f"Error in predict: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/deepseek")
async def deepseek_query(req: DeepSeekRequest):
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
        print(f"Error in deepseek: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Chat endpoints (same as before)
@app.post("/chats")
async def create_chat(chat: ChatCreate):
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
async def get_chats(user_id: str):
    db = get_database()
    if not db:
        return []
    
    chats = list(db.find({"user_id": user_id}).sort("created_at", -1))
    for chat in chats:
        chat["_id"] = str(chat["_id"])
    return chats

@app.put("/chats/{chat_id}")
async def update_chat(chat_id: str, chat: ChatUpdate):
    db = get_database()
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    result = db.update_one({"id": chat_id}, {"$set": {"conversation": chat.conversation}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return {"ok": True}

@app.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str):
    db = get_database()
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    result = db.delete_one({"id": chat_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return {"ok": True}

# Railway Fix #3: Explicit OPTIONS handlers for all routes
@app.options("/")
@app.options("/isAlive")
@app.options("/predict")
@app.options("/deepseek")
@app.options("/chats")
@app.options("/chats/{user_id}")
@app.options("/chats/{chat_id}")
async def options_handler():
    """Handle OPTIONS preflight for all routes"""
    return Response(status_code=200)

# Railway Fix #4: Startup event to log CORS config
@app.on_event("startup")
async def startup_event():
    print("=" * 50)
    print("🚀 Plant Disease API Starting")
    print(f"📍 Allowed Origins: {ALLOWED_ORIGINS}")
    print(f"🔧 CORS: Multi-layer protection enabled")
    print("=" * 50)
