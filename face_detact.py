# -*- coding: utf-8 -*-
import torch
import torchvision
device = torch.device('cpu')
import glob
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
from tqdm import tqdm
from torch.optim import optimizer
from torchvision import transforms
from torchvision import models
from torch.utils.data import Dataset, DataLoader
import cv2
import matplotlib.pyplot as plt
from IPython.display import Image,display
import face_recognition as fr
from PIL import Image
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

class ageDataset(Dataset): 
    def __init__(self, image, label, train=True, transform=None): 
        self.transform = transform 
        self.img_list = image
        self.label_list = label
        
    def __len__(self): 
        return len(self.img_list) 
    
    def __getitem__(self, idx): 
        label = self.label_list[idx] 
        img = Image.fromarray(np.uint8(self.img_list[idx])).convert('RGB') # type: ignore
        if self.transform is not None: 
            img = self.transform(img) 
        return img, label 
    
CFG = {
    'IMG_SIZE': 128,  # 이미지 사이즈 128
    'EPOCHS': 100,  # 에포크
    'BATCH_SIZE': 16,  # 배치사이즈
    'SEED': 1,  # 시드
}

test_transform = torchvision.transforms.Compose([
    transforms.Resize([CFG['IMG_SIZE'], CFG['IMG_SIZE']]),  # 각 이미지 같은 크기로 resize
    transforms.ToTensor(),  # 이미지를 텐서로 변환
    transforms.Normalize(mean=(0.5, 0.5, 0.5), std=(0.5, 0.5, 0.5))  # 평균과 표준편차를 0.5로 정규화
])

model1 = torchvision.models.resnet18(pretrained=True)
print(model1)

model1.fc = nn.Sequential( # type: ignore
    nn.Linear(512, 512),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(512, 4),
    nn.Softmax()
)

model1 = model1.to(device)

criterion = torch.nn.CrossEntropyLoss()
optimizer = optim.Adam(model1.parameters(), lr=1e-4, weight_decay=1e-4)
scheduler = None

check_point = torch.load('./best_model2.pth', map_location=torch.device('cpu'))

model = model1
model = model.to(device)
model.load_state_dict(check_point)
def classify_age(folder_path):
    image_paths = glob.glob(f'{folder_path}/*.jpg')
    face_images = []
    for image_path in image_paths:
        image = fr.load_image_file(image_path)
        encodings = fr.face_encodings(image)
        if len(encodings) > 0:
            top, right, bottom, left = fr.face_locations(image)[0]
            face_image = image[top:bottom, left:right]
            face_images.append(face_image)
            
        os.remove(image_path)
    
    if not face_images:
        return '3'  # Class '3'
    
    dataset = ageDataset(face_images, label=[0]*len(face_images), train=False, transform=test_transform)
    dataloader = DataLoader(dataset, batch_size=16, shuffle=False)
    
    age_classes = ['0', '1', '2']
    predictions = []
    probabilities = []
    
    with torch.no_grad():
        for images, _ in dataloader:
            images = images.to(device)
            outputs = model(images)
            probs = nn.functional.softmax(outputs, dim=1)  # Calculate probabilities
            _, preds = torch.max(outputs, 1)
            preds = preds.tolist()
            predictions.extend([age_classes[pred] for pred in preds])
            probabilities.extend([probs[i][pred].item() for i, pred in enumerate(preds)])
    
    # 분류에 실패한 경우 3을 추가
    if len(predictions) == 0:
        predictions.append('3')
        probabilities.append(1.0)
        
    # Change the prediction to '1' if the probability is below a threshold
    threshold = 0.3
    for i in range(len(probabilities)):
        if probabilities[i] < threshold:
            print(f"Prediction '{predictions[i]}' has a low probability of {probabilities[i]}, changing to '1'")
            predictions[i] = '1'
            probabilities[i] = 1.0  # Assuming that we are now 100% sure it's class '1'
        else:
            print(f"Prediction '{predictions[i]}' has a high probability of {probabilities[i]}")
        
    # Find the prediction with the highest probability
    max_index = probabilities.index(max(probabilities))
    return predictions[max_index]


# Flask endpoint
@app.route('/classify', methods=['POST'])
def classify():
    if request.json is None or 'folder_path' not in request.json:
        return jsonify({'error': 'Invalid request or missing folder_path'})
    
    folder_path = request.json['folder_path']
    prediction = classify_age(folder_path)
        
    return jsonify({'prediction': prediction})



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3508)