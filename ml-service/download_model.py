import gdown
import os

url = "https://drive.google.com/uc?id=1KZQmJx1FSFFfGQZ0inNZuFaWRMFazJiR"
output = "model/18_Epoch.pth"

os.makedirs("model", exist_ok=True)
print("Downloading model...")
gdown.download(url, output, quiet=False, fuzzy=True, use_cookies=True)
