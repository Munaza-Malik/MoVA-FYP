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
import threading
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# -----------------------------
# 1. CONFIG & DB CONNECTION
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FACE_DB = os.path.join(BASE_DIR, "../uploads/driver_images")

# Update 'your_database_name' to your actual MongoDB database name
client = MongoClient("mongodb://localhost:27017/")
db = client['fypdb'] 
users_col = db['users']
vehicles_col = db['vehicles']

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
    if not text: return None
    
    # 1. Standardize: Uppercase and remove non-alphanumeric
    clean = re.sub(r'[^A-Z0-9]', '', text.upper())
    
    # 2. Pattern Matching for Islamabad style (e.g., AB 123 or ABC 123)
    # This look for 2-3 letters followed by 3-4 digits
    match = re.search(r'([A-Z]{2,3})(\d{3,4})', clean)
    
    if match:
        # Returns format like "DV 595"
        return f"{match.group(1)} {match.group(2)}"
    
    # 3. Fallback: If no specific pattern, just return the alphanumeric string 
    # but filter out long strings that look like "ISLAMABAD"
    if len(clean) > 8: 
        return None
        
    return clean

def recognize_face_identity(face_img):
    if not os.path.exists(FACE_DB): 
        return "Unknown", 0
    try:
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
            if dist < 0.65: 
                full_path = os.path.normpath(match['identity'])
                file_name = os.path.basename(full_path)
                clean_name = re.split(r'[-_.]', file_name)[0] 
                accuracy = round((1 - dist) * 100, 2)
                return clean_name.upper(), accuracy 
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
                
                # Use detail=1 to get bounding boxes if you want to be even more precise,
                # but for now, we filter the combined text.
                detections = ocr_reader.readtext(preprocess_plate(crop), detail=0)
                
                combined_text = "".join(detections)
                cleaned = clean_plate_text(combined_text)
                
                if cleaned:
                    res['plate_text'] = cleaned
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

    status = "DENIED"
    driver = results['driver_name']
    plate = results['plate_text']
    msg = "Awaiting Verification"

    if driver == "Unknown":
        msg = "Denied: Face Not Matched"
    elif not plate:
        msg = "Denied: Plate Not Readable"
    else:
        # Cross-reference with MongoDB Ownership
        user = users_col.find_one({"name": {"$regex": f"^{driver}", "$options": "i"}})
        if user:
            vehicle = vehicles_col.find_one({"user": user['_id']})
            if vehicle:
                reg_plate = clean_plate_text(vehicle['plateNumber'])
                if plate == reg_plate:
                    status = "SUCCESS"
                    msg = f"Authorized: {user['name']} ({plate})"
                else:
                    msg = f"Alert: {user['name']} in Unauthorized Vehicle ({plate})"
            else:
                msg = f"Denied: No registered vehicle for {user['name']}"
        else:
            msg = f"Denied: User {driver} not found in database"

    return jsonify({
        "status": status,
        "message": msg,
        "plate": plate or "Unknown",
        "driver": driver,
        "confidence": results['confidence'],
        "crops": {"face": results['face_crop'], "plate": results['plate_crop']}
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)