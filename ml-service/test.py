from inference import predict
from PIL import Image
from deepseek import api_call

image=Image.open(r'F:\Plants_model\dataset\test\potato-early-blight-leaves.jpg').convert('RGB')
model=r'F:\Plants_model\epoch_19.pth'

result = predict(model,image)
print(result,'\n\n')
print(api_call(result))