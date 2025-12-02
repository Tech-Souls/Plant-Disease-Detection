from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from inference import predict
from pydantic import BaseModel
import base64
from PIL import Image
from io import BytesIO

app = FastAPI()
origins = [
    'http://localhost:5173'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # allow all HTTP methods
    allow_headers=["*"],  # allow all headers
)
class PredictRequest(BaseModel):
    image: str


@app.post('/predict')
def prediction(req: PredictRequest):
    try:
        img_bytes = base64.b64decode(req.image)
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        return {"error": f"Invalid image: {e}"}
    model_path = "model/epoch_19.pth"
    results = predict(model_path, img)  # pass PIL Image
    return results

@app.get("/isAlive")
def alive():
    return True

@app.get("/")
def info():
    return """
The "/predict" path is for making predictions. Give it a post request containing "image_path"
The "/isAlive" returns True if the AI side is running
"""