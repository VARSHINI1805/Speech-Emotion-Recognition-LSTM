import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict_emotion

app = Flask(__name__)
# Enable CORS for all origins, supporting frontend on 5173
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Speech Emotion Recognition Backend is Online"})

@app.route("/predict", methods=["POST"])
def predict():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio = request.files["audio"]
    if not audio or audio.filename == "":
        return jsonify({"error": "Empty audio file received"}), 400

    # Determine proper extension from filename or mimetype
    ext = os.path.splitext(audio.filename)[1].lower() if audio.filename else ""
    if not ext:
        content_type = audio.content_type or ""
        if "webm" in content_type:
            ext = ".webm"
        elif "ogg" in content_type:
            ext = ".ogg"
        elif "mp3" in content_type:
            ext = ".mp3"
        elif "wav" in content_type:
            ext = ".wav"
        else:
            ext = ".wav"

    temp_filename = f"temp_{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join(os.path.dirname(__file__), temp_filename)
    
    try:
        audio.save(temp_path)
        result = predict_emotion(temp_path)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Failed to process audio: {str(e)}"}), 500
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

