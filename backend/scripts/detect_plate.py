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
import threading # Teacher ki requirement ke liye

app = Flask(__name__)
CORS(app)

# -----------------------------
# LOAD MODELS
# -----------------------------
plate_model = YOLO("../models/plate_model.pt") 
face_model = YOLO("../models/face_model.pt") 
ocr_reader = easyocr.Reader(['en'], gpu=False)

FACE_DB = "../uploads/driver_images"

# -----------------------------
# HELPERS
# -----------------------------
def get_base64_crop(img):
    _, buffer = cv2.imencode(".jpg", img)
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()

def preprocess_plate(plate_img):
    gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, (plate_img.shape[1]*2, plate_img.shape[0]*2))
    blur = cv2.bilateralFilter(gray, 9, 75, 75)
    thresh = cv2.adaptiveThreshold(
        blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 31, 15
    )
    return thresh

def clean_plate_text(text):
    text = re.sub(r'[^A-Z0-9]', '', text.upper())
    if len(text) >= 5:
        return f"{text[:3]}-{text[3:6]}"
    return text

def recognize_face_identity(face_img):
    if not os.path.exists(FACE_DB):
        return None
    try:
        dfs = DeepFace.find(img_path=face_img, db_path=FACE_DB, enforce_detection=False, silent=True)
        if len(dfs) > 0 and not dfs[0].empty:
            matched_path = dfs[0].iloc[0]['identity']
            driver_name = os.path.basename(os.path.dirname(matched_path))
            return driver_name
    except Exception as e:
        print(f"DeepFace Match Error: {e}")
    return None

# -----------------------------
# THREAD WORKERS
# -----------------------------
def face_worker(frame, results_container):
    """Worker thread for Face Detection and Recognition"""
    face_results = face_model(frame, verbose=False)
    for r in face_results:
        for box in r.boxes.xyxy.cpu().numpy():
            x1, y1, x2, y2 = map(int, box)
            face_crop = frame[y1:y2, x1:x2]
            if face_crop.size > 0:
                results_container['face_crop_b64'] = get_base64_crop(face_crop)
                results_container['driver_name'] = recognize_face_identity(face_crop)
                return # Pehla face milte hi khatam

def plate_worker(frame, results_container):
    """Worker thread for Plate Detection and OCR"""
    plate_results = plate_model(frame, verbose=False)
    for r in plate_results:
        for box in r.boxes.xyxy.cpu().numpy():
            x1, y1, x2, y2 = map(int, box)
            plate_img = frame[y1:y2, x1:x2]
            if plate_img.size > 0:
                results_container['plate_crop_b64'] = get_base64_crop(plate_img)
                processed = preprocess_plate(plate_img)
                text_results = ocr_reader.readtext(processed, detail=0)
                if text_results:
                    results_container['plate_text'] = clean_plate_text("".join(text_results))
                return # Pehli plate milte hi khatam

# -----------------------------
# MAIN ROUTE
# -----------------------------
@app.route('/detect', methods=['POST'])
def detect():
    data = request.get_json()
    image_data = data.get('image')

    if not image_data:
        return jsonify({'error': 'No image provided'}), 400

    img_bytes = base64.b64decode(image_data.split(",")[1] if "," in image_data else image_data)
    frame = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({'error': 'Invalid image'}), 400

    # Threading container to hold results
    results = {
        'driver_name': None,
        'face_crop_b64': None,
        'plate_text': None,
        'plate_crop_b64': None
    }

    # STEP 1 & 2: Launch Threads Parallelly (Teacher's Technique)
    t_face = threading.Thread(target=face_worker, args=(frame, results))
    t_plate = threading.Thread(target=plate_worker, args=(frame, results))

    t_face.start()
    t_plate.start()

    t_face.join() # Wait for both to finish
    t_plate.join()

    # Extracting results from threads
    recognized_driver = results['driver_name']
    final_plate = results['plate_text']
    
    crop_images = []
    if results['face_crop_b64']: crop_images.append(results['face_crop_b64'])
    if results['plate_crop_b64']: crop_images.append(results['plate_crop_b64'])

    # STEP 3: SECURITY LOGIC (Same as before)
    auth_status = "DENIED"
    display_message = "Access Denied: Identity Unknown"
    detected_plates = [final_plate] if final_plate else []

    if final_plate:
        try:
            res = requests.get(f"http://localhost:5000/api/plates/{final_plate}")
            if res.status_code == 200:
                if recognized_driver:
                    auth_status = "SUCCESS"
                    display_message = f"Fully Authenticated: {recognized_driver} ({final_plate})"
                else:
                    display_message = f"Plate {final_plate} OK but Face Not Recognized"
            else:
                if recognized_driver:
                    auth_status = "SUCCESS"
                    display_message = f"Authorized Driver: {recognized_driver} (Vehicle {final_plate} Not Registered)"
                else:
                    display_message = f"Vehicle {final_plate} Unknown & Face Not Found"
        except:
            display_message = "Database Connection Error"
    else:
        if recognized_driver:
            auth_status = "SUCCESS"
            display_message = f"Authorized Driver: {recognized_driver} (Plate Not Detected)"
        else:
            display_message = "Access Denied: No Plate or Face Detected"

    return jsonify({
        "status": auth_status,
        "message": display_message,
        "plates": detected_plates,
        "plate_images": crop_images,
        "plate": final_plate or "Unknown",
        "driver": recognized_driver or "Unknown"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)