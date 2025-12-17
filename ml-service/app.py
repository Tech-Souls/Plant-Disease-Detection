from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from inference import predict
from deepseek import api_call
from pydantic import BaseModel
import base64
from PIL import Image
from io import BytesIO
import json

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

class PredictRequest(BaseModel):
    image: str

class DeepSeekRequest(BaseModel):
    prompt_data: str    

@app.post('/predict')
def prediction(req: PredictRequest):
    try:
        img_bytes = base64.b64decode(req.image)
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        return {"error": f"Invalid image: {e}"}
    model_path = "model/18_Epoch.pth"
    results = predict(model_path, img)  # pass PIL Image
    return results

@app.post('/deepseek')
def apicall(req: DeepSeekRequest):
    try:
        result = api_call(req.prompt_data)
        if not result:
            return "prompt_data wasn't sent!!!"
        try:
            result = json.loads(result)
        except:
            pass
    except Exception as e:
        return {'error': f"Error while calling Deepseek\n {e}"}
    return result

@app.get("/isAlive")
def alive():
    return True

@app.get("/")
def info():
    return """
The "/predict" path is for making predictions. Give it a post request containing "image_path"
The "/isAlive" returns True if the AI side is running
"""
