from flask import Flask, request, jsonify
import os
import cv2
import pickle
import numpy as np
from flask_cors import CORS
from sklearn.neighbors import KNeighborsClassifier
import logging

app = Flask(__name__)
CORS(app)  # Allow all frontend requests (Configure as needed)

UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', './uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

logging.basicConfig(level=logging.INFO)

# Load Face Recognition Model
def load_face_recognition_model():
    global knn, LABELS, FACES
    try:
        with open('./data/names.pkl', 'rb') as w:
            LABELS = pickle.load(w)
        with open('./data/faces_data.pkl', 'rb') as f:
            FACES = pickle.load(f)

        app.logger.info(f"Loaded face model: Faces matrix shape {FACES.shape}")

        knn = KNeighborsClassifier(n_neighbors=5)
        knn.fit(FACES, LABELS)
    except Exception as e:
        app.logger.error(f"Error loading model: {e}")
        knn, LABELS, FACES = None, None, None

facedetect = cv2.CascadeClassifier('./data/haarcascade_frontalface_default.xml')

if facedetect.empty():
    raise RuntimeError("Haar cascade file not loaded properly!")

load_face_recognition_model()

# Predict Face from Image
def predict_from_image(image_path):
    try:
        image = cv2.imread(image_path)
        if image is None:
            return "Invalid image file"

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = facedetect.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:
            return "No faces detected"

        for (x, y, w, h) in faces:
            crop_img = image[y:y+h, x:x+w]
            resized_img = cv2.resize(crop_img, (50, 50)).flatten().reshape(1, -1)
            output = knn.predict(resized_img)
            return str(output[0])

    except Exception as e:
        app.logger.error(f"Error during prediction: {e}")
        return None

# Face Recognition Endpoint
@app.route('/check_faces', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    predicted_name = predict_from_image(filepath)
    if predicted_name == "No faces detected":
        return jsonify({'message': 'No faces detected', 'error': 'No faces found in the image.'}), 600
    elif predicted_name:
        return jsonify({'predicted_name': predicted_name}), 200
    else:
        return jsonify({'error': 'Prediction failed'}), 500

# Register Face Endpoint
@app.route('/register_face', methods=['POST'])
def register_face():
    try:
        name = request.form.get('name')
        images = request.files.getlist('images')

        if not name or not images:
            return jsonify({'error': 'Name and images are required'}), 400

        faces_data = []
        user_folder = os.path.join(UPLOAD_FOLDER, 'faces', name)
        os.makedirs(user_folder, exist_ok=True)

        for idx, file in enumerate(images):
            image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                continue

            raw_image_path = os.path.join(user_folder, f"{name}_{idx + 1}.jpg")
            cv2.imwrite(raw_image_path, image)

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = facedetect.detectMultiScale(gray, 1.3, 5)

            if len(faces) > 0:
                for (x, y, w, h) in faces:
                    crop_img = image[y:y+h, x:x+w]
                    resized_img = cv2.resize(crop_img, (50, 50))
                    faces_data.append(resized_img)
                    break
            else:
                faces_data.append(cv2.resize(image, (50, 50)))

        if len(faces_data) < 100:
            return jsonify({'error': f'Only {len(faces_data)} valid faces detected. At least 100 required.'}), 400

        faces_data = np.asarray(faces_data[:100]).reshape(100, -1)

        # Update Name and Face Data
        names_file = './data/names.pkl'
        faces_file = './data/faces_data.pkl'

        if not os.path.exists(names_file):
            names = [name] * 100
        else:
            with open(names_file, 'rb') as f:
                existing_names = pickle.load(f)
            existing_names.extend([name] * 100)
            names = existing_names

        with open(names_file, 'wb') as f:
            pickle.dump(names, f)

        if not os.path.exists(faces_file):
            combined_faces = faces_data
        else:
            with open(faces_file, 'rb') as f:
                existing_faces = pickle.load(f)
            combined_faces = np.vstack([existing_faces, faces_data])

        with open(faces_file, 'wb') as f:
            pickle.dump(combined_faces, f)

        load_face_recognition_model()
        return jsonify({'message': 'Face data registered successfully', 'saved_images': len(images)}), 200

    except Exception as e:
        app.logger.error(f"Registration error: {e}")
        return jsonify({'error': str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
