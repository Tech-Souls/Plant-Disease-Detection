from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from io import BytesIO
from PIL import Image
import base64
import json
import os
import requests

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

from inference import predict
from deepseek import api_call

app = FastAPI()

allowed_origins = [
    "https://plant-dd.vercel.app",  
    "http://localhost:5173",         
    "http://localhost:3000",         
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI")
client = None
chats_collection = None

def get_mongo():
    global client, chats_collection
    if chats_collection:
        return chats_collection

    if not MONGO_URI:
        print(" MONGO_URI not set. Chat features disabled.")
        return None

    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        db = client["plant_disease_db"]
        chats_collection = db["chats"]

        chats_collection.create_index([("user_id", 1), ("created_at", -1)])
        chats_collection.create_index("id")

        print(" MongoDB connected")
        return chats_collection

    except ServerSelectionTimeoutError as e:
        print(f" MongoDB connection failed: {e}")
        return None

class PredictRequest(BaseModel):
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


@app.post("/predict")
def prediction(req: PredictRequest):
    try:
        img_bytes = base64.b64decode(req.image)
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(400, f"Invalid image: {e}")

    model_path = os.path.join(os.getcwd(), "model", "18_Epoch.pth")

    if not os.path.exists(model_path):
        raise HTTPException(500, "Model file not found")

    return predict(model_path, img)

@app.post("/deepseek")
def deepseek(req: DeepSeekRequest):
    try:
        context = json.loads(req.prompt_data)
        result = api_call(json.dumps(context))
        return json.loads(result) if isinstance(result, str) else result
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/chats")
def create_chat(chat: ChatCreate):
    col = get_mongo()
    if not col:
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

    col.insert_one(doc)
    return doc

@app.get("/chats/{user_id}")
def get_chats(user_id: str):
    col = get_mongo()
    if not col:
        return []

    chats = col.find({"user_id": user_id}).sort("created_at", -1)
    return list(chats)

@app.put("/chats/{chat_id}")
def update_chat(chat_id: str, chat: ChatUpdate):
    col = get_mongo()
    if not col:
        raise HTTPException(503, "Database unavailable")

    result = col.update_one({"id": chat_id}, {"$set": {"conversation": chat.conversation}})
    if result.matched_count == 0:
        raise HTTPException(404, "Chat not found")

    return {"ok": True}

@app.delete("/chats/{chat_id}")
def delete_chat(chat_id: str):
    col = get_mongo()
    if not col:
        raise HTTPException(503, "Database unavailable")

    result = col.delete_one({"id": chat_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Chat not found")

    return {"ok": True}

@app.get("/isAlive")
def alive():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"service": "Plant Disease Detection API"}
