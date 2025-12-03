import torch
import base64
from io import BytesIO
from torchvision import transforms
from PIL import Image
import timm
import sys

def loading_model(model_pth):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu') # If there's no gpu, import cpu
    try:
        checkpoint = torch.load(model_pth, map_location=device)

        num_classes = checkpoint['num_classes']
        model_name= checkpoint['model_name']
        class_names = checkpoint['class_names']

        model = timm.create_model(model_name,pretrained=False,num_classes=num_classes)
        model.load_state_dict(checkpoint['model_state_dict'])
        model = model.to(device)

        print("model is loaded!!!")
        print(f'Best val accuracy: {checkpoint['val_acc']*100:.2f}%')

        return model, device, class_names
    except Exception as e:
        print("Some bullshit error occured while loading model")
        print(e)
        sys.exit()

def loading_image(image):
    try:
        transform = transforms.Compose([
            transforms.Resize((224,224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        image_tensor = transform(image).unsqueeze(0)
        return image_tensor
    except Exception as e:
        print("Error while loading image\n",e)

def predictor(model,image_tensor,device,class_names,top_k=27):
    image_tensor= image_tensor.to(device) # In case the device is gpu
    with torch.no_grad():
        outputs = model(image_tensor)   
        probabilities = torch.softmax(outputs,dim=1)[0] # 0 because batch size is 0. dim=1 because each column represents a class.

        top_pred, top_indices = torch.topk(probabilities, k=top_k)

        results = []
        for pred,index in zip(top_pred,top_indices):
            results.append({
                'class': class_names[index.item()],
                'confidence': pred.item()*100
            })
        return results
    
def predict(model_pth,image,top_k=5):
    model, device, class_names = loading_model(model_pth)
    image_tensor = loading_image(image)
    results = predictor(model,image_tensor,device,class_names)

    return results
