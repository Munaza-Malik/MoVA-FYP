# backend/detectPlate.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import easyocr
import cv2
import numpy as np
import base64
import sqlite3
import re

app = Flask(__name__)
CORS(app)

# ====== Load models ======
model = YOLO("../models/best.pt")  # Your YOLO number plate detection model
ocr_reader = easyocr.Reader(["en"])

# ====== Database helper ======
DB_PATH = "vehicles.db"  # SQLite database

def check_plate_in_db(plate_text):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM vehicles WHERE plate=?", (plate_text,))
        result = cursor.fetchone()
        conn.close()
        return result  # None if not found
    except Exception as e:
        print("DB error:", e)
        return None

# ====== Home ======
@app.route('/')
def home():
    return " YOLOv8 + OCR + DB API is running!"

# ====== Detect license plate safely ======
@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.get_json()
        image_data = data.get("image")
        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        # Decode base64 → OpenCV image
        if "," in image_data:
            img_bytes = base64.b64decode(image_data.split(",")[1])
        else:
            img_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            return jsonify({"error": "Invalid image"}), 400

        # Run YOLO detection
        results = model(frame)

        plate_numbers = []
        plate_images = []
        matched = False
        vehicle_info = {}

        # Loop over YOLO detections
        for r in results:
            try:
                boxes = r.boxes.xyxy.cpu().numpy()
                for (x1, y1, x2, y2) in boxes:
                    # Crop plate
                    plate = frame[int(y1):int(y2), int(x1):int(x2)]
                    if plate.size == 0:
                        continue

                    # Optional: remove top 15-20% where province/city name usually is
                    height = plate.shape[0]
                    plate_number_area = plate[int(height*0.2):, :]

                    # OCR read
                    try:
                        text_list = ocr_reader.readtext(plate_number_area, detail=0)
                        if not text_list:
                            continue
                        raw_text = "".join(text_list).replace(" ", "").upper()

                        # Keep only letters A-Z and numbers 0-9 (ignore "ICT", "Punjab", etc.)
                        numbers_only = re.findall(r'[A-Z0-9]+', raw_text)
                        if not numbers_only:
                            continue
                        plate_number = numbers_only[0]  # take the first valid sequence
                        plate_numbers.append(plate_number)

                        # Convert cropped plate to base64
                        _, buffer = cv2.imencode(".jpg", plate)
                        plate_base64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode()
                        plate_images.append(plate_base64)

                        # Check DB
                        db_result = check_plate_in_db(plate_number)
                        if db_result and not matched:  # Only take first matched vehicle
                            matched = True
                            vehicle_info = {"owner": db_result[1], "type": db_result[2]}

                    except Exception as e:
                        print("OCR or DB processing error:", e)
                        continue

            except Exception as e:
                print("YOLO result processing error:", e)
                continue

        return jsonify({
            "plates": plate_numbers,
            "plate_images": plate_images,
            "match": matched,
            "vehicle_info": vehicle_info
        })

    except Exception as e:
        print("Unexpected error in /detect:", e)
        return jsonify({"error": str(e)}), 500

# ====== Save log route ======
@app.route("/api/logs", methods=["POST"])
def save_log():
    try:
        data = request.get_json()
        plate = data.get("plate")
        status = data.get("status")  # "Entry" or "Exit"
        user = data.get("user", "Unknown")  # optional, default "Unknown"

        if not plate or not status:
            return jsonify({"error": "Missing required fields"}), 400

        # Ensure logs table exists
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT,
                plate TEXT,
                status TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Insert the log
        cursor.execute(
            "INSERT INTO logs (user, plate, status) VALUES (?, ?, ?)",
            (user, plate, status)
        )
        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Log saved successfully"})

    except Exception as e:
        print("Error saving log:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
