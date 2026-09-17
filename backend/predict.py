import os
import pickle
import numpy as np
import librosa
from tensorflow.keras.models import load_model

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.abspath(os.path.join(BASE_DIR, "../model/speech_emotion_lstm.keras"))
SCALER_PATH = os.path.abspath(os.path.join(BASE_DIR, "../model/feature_scaler.pkl"))
LABELS_PATH = os.path.abspath(os.path.join(BASE_DIR, "../model/emotion_labels.pkl"))

SAMPLE_RATE = 16000
N_MFCC = 40
MAX_LEN = 250
HOP_LENGTH = 256
N_FFT = 512

model = load_model(MODEL_PATH)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

with open(LABELS_PATH, "rb") as f:
    labels = pickle.load(f)

def extract_features(file_path):
    audio, sr = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)
    audio, _ = librosa.effects.trim(audio, top_db=25)

    if len(audio) == 0:
        audio = np.zeros(SAMPLE_RATE, dtype=np.float32)

    max_amp = np.max(np.abs(audio))
    if max_amp > 0:
        audio = audio / max_amp

    mfcc = librosa.feature.mfcc(
        y=audio, sr=sr, n_mfcc=N_MFCC,
        n_fft=N_FFT, hop_length=HOP_LENGTH
    )
    delta = librosa.feature.delta(mfcc)
    delta_delta = librosa.feature.delta(mfcc, order=2)

    features = np.concatenate([mfcc, delta, delta_delta], axis=0)

    if features.shape[1] < MAX_LEN:
        features = np.pad(
            features,
            ((0, 0), (0, MAX_LEN - features.shape[1])),
            mode="constant"
        )
    else:
        features = features[:, :MAX_LEN]

    features = features.T.astype(np.float32)

    features = scaler.transform(
        features.reshape(-1, features.shape[1])
    ).reshape(1, MAX_LEN, N_MFCC * 3)

    return features

def predict_emotion(file_path):
    features = extract_features(file_path)
    probabilities = model.predict(features, verbose=0)[0]
    index = int(np.argmax(probabilities))

    return {
        "emotion": labels[index],
        "confidence": float(probabilities[index]),
        "probabilities": {
            labels[i]: float(probabilities[i])
            for i in range(len(labels))
        }
    }
