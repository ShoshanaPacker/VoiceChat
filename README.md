
# Smart Voice Assistant (React + Flask + AI)

A voice-based smart assistant system combining an interactive React interface with a Flask API for natural language and speech processing — including speech recognition,
LLaMA-based responses, and text-to-speech conversion.

---

##  Key Technologies

### Backend (Python + Flask)
- **Flask** with Flask-RESTX (including Swagger)
- **Vosk** for speech-to-text recognition
- **LLaMA (llama.cpp)** for smart textual responses
- **gTTS + ffmpeg** for text-to-speech synthesis
- **CORS** and temporary audio file handling

### Frontend (React)
- **React + MUI** for design
- **react-media-recorder** for in-browser audio recording
- Record, send, and play responses from the server

---

##  How It Works

1. User clicks 🎤 and records a voice question.
2. The recording is sent to the Flask backend as a WAV file.
3. The server converts the audio and transcribes it using Vosk.
4. The recognized text is sent to LLaMA for a response.
5. The response is converted to speech using gTTS.
6. The audio reply is sent back and played for the user 🎧

---

##  Project Structure

```
VoiceChat/
├── backend/            ← Flask code + models
│   ├── app.py
│   ├── models/         ← vosk, llama
│   └── requirements.txt
├── client/             ← React code
│   ├── src/ChatApp.jsx
│   ├── public/
│   └── package.json
└── README.md
```

---

##  Setup & Run

### 1. Backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

### 2. Frontend (React)
```bash
cd client
npm install
npm start
```

---

##  Required Models

- **Vosk Model**:
  Download `vosk-model-small-en-us-0.15` from: [https://alphacephei.com/vosk/models](https://alphacephei.com/vosk/models)

- **LLaMA GGUF**:
  Run with llama.cpp and download `mistral-7b-instruct` from Hugging Face or a similar provider.

---

##  Requirements

- Python 3.11
- Node.js 14+
- FFmpeg installed and available in PATH
- GPU access (recommended but optional)

##  Contact

**Name:** [shoshana packer]  
**Email:** [shoshanapacker76@gmail.com]  

