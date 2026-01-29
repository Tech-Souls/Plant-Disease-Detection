from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
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

# Option 1: Use built-in CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://plant-dd.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"  # For testing, remove in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Option 2: Custom middleware that runs BEFORE Railway's proxy
@app.middleware("http")
async def add_cors_middleware(request: Request, call_next):
    """Add CORS headers to every response - placed BEFORE other middleware"""
    
    # Handle preflight requests
    if request.method == "OPTIONS":
        response = JSONResponse(
            content={"status": "ok"},
            headers={
                "Access-Control-Allow-Origin": "https://plant-dd.vercel.app",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With",
                "Access-Control-Max-Age": "600",
                "Access-Control-Allow-Credentials": "true",
            }
        )
        return response
    
    # Process the request
    response = await call_next(request)
    
    # Add CORS headers to the response
    origin = request.headers.get("origin")
    if origin and origin in ["https://plant-dd.vercel.app", "http://localhost:3000", "http://localhost:5173"]:
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        response.headers["Access-Control-Allow-Origin"] = "https://plant-dd.vercel.app"
    
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Expose-Headers"] = "*"
    
    return response

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
async def predict_disease(req: ImageRequest):
    """Predict plant disease from image"""
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
    """Query DeepSeek API"""
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

# Chat endpoints
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
    # Convert ObjectId to string for JSON serialization
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

# Explicit OPTIONS handler for all routes
@app.options("/{full_path:path}")
async def options_handler(full_path: str, request: Request):
    """Handle all OPTIONS preflight requests"""
    return JSONResponse(
        content={"status": "ok"},
        headers={
            "Access-Control-Allow-Origin": "https://plant-dd.vercel.app",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With",
            "Access-Control-Max-Age": "600",
            "Access-Control-Allow-Credentials": "true",
        }
    )
