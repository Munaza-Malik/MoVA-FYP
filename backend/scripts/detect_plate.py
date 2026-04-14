from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from deepface import DeepFace
import easyocr
import cv2
import numpy as np
import base64
import re
import os
import requests
import threading

app = Flask(__name__)
CORS(app)

# -----------------------------
# 1. CONFIG & MODELS
# -----------------------------
# Use absolute paths to avoid confusion
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FACE_DB = os.path.join(BASE_DIR, "../uploads/driver_images")

plate_model = YOLO("../models/plate_model.pt") 
face_model = YOLO("../models/face_model.pt") 
ocr_reader = easyocr.Reader(['en'], gpu=False)

# -----------------------------
# 2. HELPERS
# -----------------------------
def get_base64_crop(img):
    _, buffer = cv2.imencode(".jpg", img)
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()

def preprocess_plate(plate_img):
    gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, (plate_img.shape[1]*2, plate_img.shape[0]*2))
    blur = cv2.bilateralFilter(gray, 9, 75, 75)
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 31, 15)
    return thresh

def clean_plate_text(text):
    text = re.sub(r'[^A-Z0-9]', '', text.upper())
    return f"{text[:3]}-{text[3:6]}" if len(text) >= 5 else text

def recognize_face_identity(face_img):
    if not os.path.exists(FACE_DB): 
        return "Unknown", 0
    try:
        # We use 'cosine' and 'VGG-Face' for best compatibility
        dfs = DeepFace.find(
            img_path=face_img, 
            db_path=FACE_DB, 
            enforce_detection=False, 
            silent=True, 
            distance_metric='cosine',
            model_name='VGG-Face'
        )
        
        if len(dfs) > 0 and not dfs[0].empty:
            match = dfs[0].iloc[0]
            dist = match['distance']
            
            # Threshold Check: Lower distance = Higher similarity
            if dist < 0.65: 
                # Extract filename from the identity path
                full_path = os.path.normpath(match['identity'])
                file_name = os.path.basename(full_path) # e.g., "Munaza_1771.jpg"
                
                # Clean the name: Remove the timestamp and extension
                # This takes everything before the first hyphen or underscore
                clean_name = re.split(r'[-_]', file_name)[0] 
                
                accuracy = round((1 - dist) * 100, 2)
                return clean_name.upper(), accuracy # Returns "MUNAZA"
                
    except Exception as e:
        print(f"Match Error: {e}")
        
    return "Unknown", 0

# -----------------------------
# 3. THREAD WORKERS
# -----------------------------
def face_worker(frame, res):
    results = face_model(frame, verbose=False)
    for r in results:
        for box in r.boxes.xyxy.cpu().numpy():
            x1, y1, x2, y2 = map(int, box)
            crop = frame[y1:y2, x1:x2]
            if crop.size > 0:
                res['face_crop'] = get_base64_crop(crop)
                res['driver_name'], res['confidence'] = recognize_face_identity(crop)
                return

def plate_worker(frame, res):
    results = plate_model(frame, verbose=False)
    for r in results:
        for box in r.boxes.xyxy.cpu().numpy():
            x1, y1, x2, y2 = map(int, box)
            crop = frame[y1:y2, x1:x2]
            if crop.size > 0:
                res['plate_crop'] = get_base64_crop(crop)
                txt = ocr_reader.readtext(preprocess_plate(crop), detail=0)
                if txt: res['plate_text'] = clean_plate_text("".join(txt))
                return

# -----------------------------
# 4. API ROUTE
# -----------------------------
@app.route('/detect', methods=['POST'])
def detect():
    data = request.get_json()
    img_bytes = base64.b64decode(data['image'].split(",")[1])
    frame = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
    
    results = {'driver_name': "Unknown", 'face_crop': None, 'plate_text': None, 'plate_crop': None, 'confidence': 0}
    
    t1 = threading.Thread(target=face_worker, args=(frame, results))
    t2 = threading.Thread(target=plate_worker, args=(frame, results))
    t1.start(); t2.start(); t1.join(); t2.join()

    # Logic decision
    status, msg = "DENIED", "Identity Not Verified"
    
    if results['driver_name'] != "Unknown":
        if results['plate_text']:
            status, msg = "SUCCESS", f"Authorized: {results['driver_name']} ({results['plate_text']})"
        else:
            status, msg = "SUCCESS", f"Authorized: {results['driver_name']} (No Plate)"
    elif results['plate_text']:
        msg = f"Unknown Driver in Vehicle {results['plate_text']}"

    return jsonify({
        "status": status,
        "message": msg,
        "plate": results['plate_text'] or "Unknown",
        "driver": results['driver_name'],
        "confidence": results['confidence'],
        "crops": {"face": results['face_crop'], "plate": results['plate_crop']}
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)