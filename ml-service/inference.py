import torch
import base64
from io import BytesIO
from torchvision import transforms
from PIL import Image
import timm

def loading_model(model_pth):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    try:
        checkpoint = torch.load(model_pth, map_location=device, weights_only=False)
        
        class_to_idx = checkpoint['class_to_idx'].items()
        class_to_idx = {k: v for k, v in class_to_idx}
        num_classes = len(class_to_idx)
        model_name = 'resnet18'
        class_names = list(class_to_idx.keys())

        model = timm.create_model(model_name, pretrained=False, num_classes=num_classes)
        model.load_state_dict(checkpoint['model_state_dict'])
        model = model.to(device)
        model.eval()

        print("model is loaded!!!")
        return model, device, class_names
    except Exception as e:
        print("Error occurred while loading model")
        print(e)
        raise e
        
def loading_image(image):
    try:
        transform=transforms.Compose([
            transforms.Resize((224,224)),
            transforms.Grayscale(num_output_channels=3),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
        ])
        image_tensor = transform(image).unsqueeze(0)
        return image_tensor
    except Exception as e:
        print("Error while loading image\n",e)

def predictor(model,image_tensor,device,class_names,top_k=None):
    image_tensor= image_tensor.to(device) # In case the device is gpu
    with torch.no_grad():
        outputs = model(image_tensor)   
        probabilities = torch.softmax(outputs,dim=1)[0] # 0 because batch size is 0. dim=1 because each column represents a class.
        top_k=len(class_names)
        top_pred, top_indices = torch.topk(probabilities, k=top_k)

        results = []
        for pred,index in zip(top_pred,top_indices):
            results.append({
                'class': class_names[index.item()],
                'confidence': pred.item()*100
            })
        return results

def predict(model_pth,image):
    model, device, class_names = loading_model(model_pth)
    image_tensor = loading_image(image)
    results = predictor(model,image_tensor,device,class_names)

    return results