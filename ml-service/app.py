from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from inference import predict
from deepseek import api_call
from pydantic import BaseModel
import base64
from PIL import Image
from io import BytesIO
import json
from datetime import datetime
from typing import List, Optional
import requests
from pymongo import MongoClient
from bson import ObjectId
import os

app = FastAPI()
origins = [
    "https://plant-dd.vercel.app",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["plant_disease_db"]
chats_collection = db["chats"]

# Create indexes for better query performance
chats_collection.create_index([("user_id", 1), ("created_at", -1)])
chats_collection.create_index("id")

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
    imageData: Optional[str] = None  # Changed from imagePreview to imageData to store full base64
    location: Optional[dict] = None
    timestamp: str

class ChatUpdate(BaseModel):
    conversation: List[dict]

def get_location_info(latitude, longitude):
    """Get location details using reverse geocoding"""
    try:
        # Using Nominatim (OpenStreetMap) - free, no API key needed
        url = f"https://nominatim.openstreetmap.org/reverse"
        params = {
            "lat": latitude,
            "lon": longitude,
            "format": "json",
            "addressdetails": 1
        }
        headers = {
            "User-Agent": "PlantDiseasePredictor/1.0"
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            address = data.get("address", {})
            
            return {
                "city": address.get("city") or address.get("town") or address.get("village"),
                "state": address.get("state"),
                "country": address.get("country"),
                "country_code": address.get("country_code"),
                "display_name": data.get("display_name"),
                "raw_address": address
            }
    except Exception as e:
        print(f"Error getting location info: {e}")
    
    return None

def search_local_places(query, latitude, longitude, location_info):
    """Search for local places using Overpass API (OpenStreetMap)"""
    try:
        # Search radius in meters (10km for agricultural services, 5km for stores)
        radius = 10000 if "doctor" in query.lower() or "expert" in query.lower() else 5000
        
        # Overpass API query for agricultural services and stores
        overpass_url = "https://overpass-api.de/api/interpreter"
        
        # Build query based on what user is looking for
        tags = []
        
        # Agricultural experts/offices
        if "doctor" in query.lower() or "expert" in query.lower() or "extension" in query.lower():
            tags.append("office=government")  # Extension offices
            tags.append("office=association")  # Agricultural associations
            tags.append("amenity=public_building")  # Agricultural dept buildings
        
        # Agricultural supply stores
        if "store" in query.lower() or "shop" in query.lower() or "supply" in query.lower():
            tags.append("shop=agrarian")
            tags.append("shop=farm")
            tags.append("shop=trade")
        
        # Nurseries for plants/seeds
        if "nursery" in query.lower() or "plant" in query.lower() or "seed" in query.lower():
            tags.append("shop=garden_centre")
            tags.append("landuse=plant_nursery")
        
        if not tags:
            # Default search for agricultural-related places
            tags = ["shop=agrarian", "shop=garden_centre", "office=government", "shop=farm"]
        
        # Build Overpass QL query
        tag_queries = " or ".join([f'["{tag.split("=")[0]}"="{tag.split("=")[1]}"]' for tag in tags])
        overpass_query = f"""
        [out:json];
        (
          node(around:{radius},{latitude},{longitude}){tag_queries};
          way(around:{radius},{latitude},{longitude}){tag_queries};
        );
        out center 10;
        """
        
        response = requests.post(overpass_url, data={"data": overpass_query}, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            elements = data.get("elements", [])
            
            places = []
            for element in elements[:5]:  # Limit to top 5 results
                tags = element.get("tags", {})
                lat = element.get("lat") or element.get("center", {}).get("lat")
                lon = element.get("lon") or element.get("center", {}).get("lon")
                
                place = {
                    "name": tags.get("name", "Unnamed"),
                    "type": tags.get("shop") or tags.get("amenity") or tags.get("landuse"),
                    "address": tags.get("addr:street", ""),
                    "phone": tags.get("phone", ""),
                    "opening_hours": tags.get("opening_hours", ""),
                    "lat": lat,
                    "lon": lon
                }
                
                # Calculate approximate distance
                if lat and lon:
                    # Simple distance calculation (rough)
                    import math
                    R = 6371  # Earth's radius in km
                    dlat = math.radians(lat - latitude)
                    dlon = math.radians(lon - longitude)
                    a = (math.sin(dlat/2) * math.sin(dlat/2) + 
                         math.cos(math.radians(latitude)) * math.cos(math.radians(lat)) * 
                         math.sin(dlon/2) * math.sin(dlon/2))
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                    distance = R * c
                    place["distance_km"] = round(distance, 2)
                
                places.append(place)
            
            return places if places else None
    except Exception as e:
        print(f"Error searching local places: {e}")
    
    return None

@app.post('/predict')
def prediction(req: PredictRequest):
    try:
        img_bytes = base64.b64decode(req.image)
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        return {"error": f"Invalid image: {e}"}
    model_path = "model/18_Epoch.pth"
    results = predict(model_path, img)
    return results

@app.post('/deepseek')
def apicall(req: DeepSeekRequest):
    try:
        # Parse the prompt data
        prompt_context = json.loads(req.prompt_data)
        
        # Extract location if present
        location = prompt_context.get("location")
        location_context = ""
        
        if location and location.get("latitude") and location.get("longitude"):
            lat = location["latitude"]
            lon = location["longitude"]
            
            # Get location details
            location_info = get_location_info(lat, lon)
            
            if location_info:
                location_context = f"\n\nUser Location Information:\n"
                location_context += f"- City: {location_info.get('city', 'Unknown')}\n"
                location_context += f"- State/Region: {location_info.get('state', 'Unknown')}\n"
                location_context += f"- Country: {location_info.get('country', 'Unknown')}\n"
                location_context += f"- Coordinates: {lat:.4f}, {lon:.4f}\n"
                
                # Add location info to context
                prompt_context["location_details"] = location_info
        
        # Call DeepSeek with enhanced context
        result = api_call(json.dumps(prompt_context))
        
        if not result:
            return "prompt_data wasn't sent!!!"
        
        try:
            result = json.loads(result)
        except:
            pass
            
    except Exception as e:
        return {'error': f"Error while calling Deepseek\n {e}"}
    
    return result

@app.post('/search-local-places')
def search_places(request: dict):
    """Endpoint to search for local agricultural experts/stores"""
    try:
        query = request.get("query", "agricultural expert")
        latitude = request.get("latitude")
        longitude = request.get("longitude")
        
        if not latitude or not longitude:
            raise HTTPException(status_code=400, detail="Location coordinates required")
        
        # Get location info
        location_info = get_location_info(latitude, longitude)
        
        # Search for places
        places = search_local_places(query, latitude, longitude, location_info)
        
        return {
            "location": location_info,
            "places": places or [],
            "query": query,
            "suggestions": {
                "search_terms": [
                    "agricultural extension office near me",
                    "agronomist near me",
                    "crop consultant near me",
                    "agricultural department",
                    "plant pathologist near me"
                ],
                "fallback_message": "If no experts are found nearby, you can also purchase recommended treatments from local agricultural supply stores."
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching places: {e}")

# Chat CRUD endpoints with MongoDB
@app.post('/chats')
def create_chat(chat: ChatCreate):
    """Create a new chat in MongoDB with full image data"""
    try:
        chat_document = {
            "id": chat.id,
            "user_id": chat.userId,
            "title": chat.title,
            "plant": chat.plant,
            "plant_display_name": chat.plantDisplayName,
            "conversation": chat.conversation,
            "filtered_prediction": chat.filteredPrediction,
            "image_data": chat.imageData,  # Store full base64 image
            "location": chat.location,
            "timestamp": chat.timestamp,
            "created_at": datetime.utcnow()
        }
        
        result = chats_collection.insert_one(chat_document)
        
        # Return the created chat (excluding MongoDB _id)
        return {
            "id": chat.id,
            "title": chat.title,
            "plant": chat.plant,
            "plantDisplayName": chat.plantDisplayName,
            "conversation": chat.conversation,
            "filteredPrediction": chat.filteredPrediction,
            "imageData": chat.imageData,
            "location": chat.location,
            "timestamp": chat.timestamp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating chat: {e}")

@app.get('/chats/{user_id}')
def get_user_chats(user_id: str):
    """Get all chats for a user from MongoDB"""
    try:
        # Find all chats for the user, sorted by creation date (newest first)
        chats_cursor = chats_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1)
        
        chats = []
        for chat in chats_cursor:
            chats.append({
                "id": chat.get("id"),
                "title": chat.get("title"),
                "plant": chat.get("plant"),
                "plantDisplayName": chat.get("plant_display_name"),
                "conversation": chat.get("conversation", []),
                "filteredPrediction": chat.get("filtered_prediction", []),
                "imageData": chat.get("image_data"),  # Return full image data
                "location": chat.get("location"),
                "timestamp": chat.get("timestamp")
            })
        
        return chats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chats: {e}")

@app.put('/chats/{chat_id}')
def update_chat(chat_id: str, chat: ChatUpdate):
    """Update a chat's conversation in MongoDB"""
    try:
        result = chats_collection.update_one(
            {"id": chat_id},
            {"$set": {"conversation": chat.conversation}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        return {"message": "Chat updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating chat: {e}")

@app.delete('/chats/{chat_id}')
def delete_chat(chat_id: str):
    """Delete a chat from MongoDB"""
    try:
        result = chats_collection.delete_one({"id": chat_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        return {"message": "Chat deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting chat: {e}")

@app.get("/isAlive")
def alive():
    return True

@app.get("/")
def info():
    return """
The "/predict" path is for making predictions. Give it a post request containing "image_path"
The "/deepseek" path is for AI chat responses with location-aware recommendations
The "/search-local-places" path searches for nearby agricultural experts, extension offices, and supply stores
The "/chats" endpoints handle chat storage (MongoDB):
  - POST /chats - Create new chat (with full image data)
  - GET /chats/{user_id} - Get all user chats (with images)
  - PUT /chats/{chat_id} - Update chat conversation
  - DELETE /chats/{chat_id} - Delete chat
The "/isAlive" returns True if the AI side is running

Search query types:
  - "agricultural expert" or "doctor" - finds extension offices, agronomists
  - "store" or "supply" - finds agricultural supply stores
  - "nursery" - finds plant nurseries and garden centers
"""