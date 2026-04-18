from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import cv2
import base64
from ultralytics import YOLO
import easyocr
import numpy as np

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Load YOLO (class 0 = license plate)
yolo_model = YOLO("backend/models/best.pt")

# OCR model
reader = easyocr.Reader(["en"], gpu=False)

@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.get_json()
        image_data = data.get("image")

        # decode base64 → OpenCV image
        img_bytes = base64.b64decode(image_data.split(",")[1])
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        results = model(frame)

        plate_texts = []
        plate_image_base64 = None

        for r in results:
            boxes = r.boxes.xyxy.cpu().numpy()
            for (x1, y1, x2, y2) in boxes:
                plate = frame[int(y1):int(y2), int(x1):int(x2)]

                # Save cropped plate image
                if plate.size > 0:
                    _, buffer = cv2.imencode('.jpg', plate)
                    plate_image_base64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode()

                    # OCR
                    text = ocr_reader.readtext(plate, detail=0)
                    if text:
                        plate_texts.append(" ".join(text))

        return jsonify({
            "text": plate_texts,
            "plate_image": plate_image_base64
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
