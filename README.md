# Speech Emotion Recognition Using LSTM Networks

Deep Learning-Based Speech Emotion Recognition using the RAVDESS speech dataset.

## Model
- BiLSTM
- Attention
- MFCC + Delta + Delta-Delta
- 8 emotion classes

## Emotion Classes
1. Neutral
2. Calm
3. Happy
4. Sad
5. Angry
6. Fearful
7. Disgust
8. Surprised

## Project Structure
- `model/` - trained model, scaler and labels
- `backend/` - Python/Flask prediction API
- `frontend/` - future React frontend

## Important
The model and preprocessing artifacts in `model/` are the trained files supplied with this project.
