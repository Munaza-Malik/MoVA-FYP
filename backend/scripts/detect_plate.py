# backend/detect_plate.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import easyocr
import cv2
import numpy as np
import base64
import re

app = Flask(__name__)
CORS(app)

# -----------------------------
# Load YOLO model and EasyOCR
# -----------------------------
model = YOLO("../models/best.pt")
ocr_reader = easyocr.Reader(['en'], gpu=False)  # Set gpu=True if you have CUDA

# -----------------------------
# Plate preprocessing function
# -----------------------------
def preprocess_plate(plate_img):
    # Convert to grayscale
    gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
    
    # Resize for better OCR accuracy
    scale = 2
    gray = cv2.resize(gray, (plate_img.shape[1]*scale, plate_img.shape[0]*scale))
    
    # Reduce noise while keeping edges
    blur = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Adaptive threshold to get binary image
    thresh = cv2.adaptiveThreshold(
        blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 31, 15
    )
    
    # Morphological close to fill gaps
    kernel = np.ones((3, 3), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)
    
    return cleaned

# -----------------------------
# Clean OCR text
# -----------------------------
def clean_plate_text(text):
    text = re.sub(r'[^A-Z0-9]', '', text.upper())
    if len(text) >= 5:
        # Ensure pattern ABC-123
        letters = text[:3]
        digits = text[3:6]
        return f"{letters}-{digits}"
    return ""


# -----------------------------
# Routes
# -----------------------------
@app.route('/')
def home():
    return "YOLO + OCR API running"

@app.route('/detect', methods=['POST'])
def detect():
    data = request.get_json()
    image_data = data.get('image')
    if not image_data:
        return jsonify({'error': 'No image provided'}), 400

    # Decode base64 image
    img_bytes = base64.b64decode(image_data.split(",")[1] if "," in image_data else image_data)
    frame = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({'error': 'Invalid image'}), 400

    results = model(frame)
    plates = []
    plate_images = []

    for r in results:
        boxes = r.boxes.xyxy.cpu().numpy()
        for (x1, y1, x2, y2) in boxes:
            plate_img = frame[int(y1):int(y2), int(x1):int(x2)]
            if plate_img.size == 0:
                continue

            processed = preprocess_plate(plate_img)
            text_results = ocr_reader.readtext(processed, detail=0)
            if not text_results:
                continue

            raw_text = "".join(text_results)
            plate_number = clean_plate_text(raw_text)
            if not plate_number:
                continue

            plates.append(plate_number)

            # Encode plate image as base64 for frontend preview
            _, buffer = cv2.imencode(".jpg", plate_img)
            plate_base64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode()
            plate_images.append(plate_base64)

    return jsonify({'plates': plates, 'plate_images': plate_images})

# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
