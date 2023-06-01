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
        return ['3']
    
    dataset = ageDataset(face_images, label=[0]*len(face_images), train=False, transform=test_transform)
    dataloader = DataLoader(dataset, batch_size=16, shuffle=False)
    
    age_classes = ['0', '1', '2']
    predictions = []
    
    with torch.no_grad():
        for images, _ in dataloader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            preds = preds.tolist()
            predictions.extend([age_classes[pred] for pred in preds])
    
    # 분류에 실패한 경우 3을 추가
    if len(predictions) == 0:
        predictions.append('3')
        
    return predictions
            
@app.route('/classify', methods=['POST'])
def classify():
    if request.json is None or 'folder_path' not in request.json:
        return jsonify({'error': 'Invalid request or missing folder_path'})
    
    folder_path = request.json['folder_path']
    predictions = classify_age(folder_path)
    
    if len(predictions) > 0:
        predictions = predictions[0]
    else:
        predictions = '3'
        
    return jsonify({'preictions': predictions})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3508)