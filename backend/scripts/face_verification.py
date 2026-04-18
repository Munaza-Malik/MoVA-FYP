# backend/face_verification.py
import os
import cv2
from deepface import DeepFace
from ultralytics import YOLO

# Load Module 2 YOLO model for face detection
face_detector = YOLO("../models/face_model.pt")

# Aapka registration images ka path (Backend folder ke mutabiq)
UPLOAD_FOLDER = "uploads/driver_images" 

def verify_driver_face(current_frame, plate_number):
    """
    current_frame: Camera se aayi hui live image
    plate_number: OCR se nikala hua number (e.g., ABC-123)
    """
    # 1. Database/Folder se registered image dhoondna
    # Note: Registration ke waqt aap plate number ko filename bana saktay hain
    ref_img_path = os.path.join(UPLOAD_FOLDER, f"{plate_number}.jpg")
    
    if not os.path.exists(ref_img_path):
        return False, "Vehicle not registered or photo missing"

    # 2. Live frame mein driver ka face dhoondna (YOLOv11)
    results = face_detector(current_frame)
    
    for r in results:
        boxes = r.boxes.xyxy.cpu().numpy()
        if len(boxes) > 0:
            # Pehla face crop karein
            x1, y1, x2, y2 = map(int, boxes[0])
            live_face_crop = current_frame[y1:y2, x1:x2]
            
            try:
                # 3. DeepFace se compare karna
                result = DeepFace.verify(
                    img1_path = live_face_crop, 
                    img2_path = ref_img_path,
                    enforce_detection = False,
                    model_name = "VGG-Face", # Fast and accurate
                    distance_metric = "cosine"
                )
                
                if result["verified"]:
                    return True, "Face Verified Successfully"
                else:
                    return False, "Face mismatch! Not the registered driver."
                    
            except Exception as e:
                return False, f"Verification Error: {str(e)}"
                
    return False, "Driver face not visible to camera"