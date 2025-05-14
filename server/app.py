from flask import Flask, request, send_file
from flask_cors import CORS
from flask_restx import Api, Resource
import subprocess
import wave
import json
import os
from gtts import gTTS
from vosk import Model, KaldiRecognizer
from llama_cpp import Llama

app = Flask(__name__)
api = Api(app, doc='/swagger/')
CORS(app)

# הגדרת נתיבי המודלים
vosk_model_path = "models/vosk/vosk-model-small-en-us-0.15"
llama_model_path = "models/mistral-7b-instruct-v0.1.Q4_K_M.gguf"

# טענת המודלים מראש
speech_model = Model(vosk_model_path)
llm = Llama(model_path=llama_model_path, n_ctx=512)

@api.route('/voice')
class Voice(Resource):
    def post(self):
        try:
            print("===> Processing POST request for /voice")

            if "audio" not in request.files:
                print("===> Error: 'audio' not found in request.files")
                return {"error": "Missing audio file"}, 400

            audio_file = request.files["audio"]
            audio_path = "input.wav"
            audio_file.save(audio_path)
            print("===> Saved input.wav")

            # המרת הקובץ ל-16kHz מונו בעזרת ffmpeg
            converted_path = "converted.wav"
            print("===> Converting to 16kHz mono with ffmpeg")
            subprocess.run(["ffmpeg", "-y", "-i", audio_path, "-ar", "16000", "-ac", "1", converted_path], check=True)
            print("===> Successfully converted to converted.wav")

            # זיהוי דיבור באמצעות vosk
            print("===> Starting speech recognition with vosk")
            wf = wave.open(converted_path, "rb")
            rec = KaldiRecognizer(speech_model, 16000)

            final_text = ""
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if rec.AcceptWaveform(data):
                    res = json.loads(rec.Result())
                    print(f"===> Partial result: {res}")
                    final_text += res.get("text", "") + " "
            wf.close()

            print(f"===> Final result: {final_text.strip()}")

            if not final_text.strip():
                print("===> No speech recognized")
                return {"error": "No speech recognized"}, 400

            # שליחה למודל LLaMA
            print("===> Sending to LLaMA model")
            prompt = f"### User:\n{final_text}\n\n### Assistant:"
            response = llm.create_chat_completion(
                messages=[{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": final_text}],
                max_tokens=100
            )
            print(f"===> Model response: {response}")
            answer = response["choices"][0]["message"]["content"].strip()

            # המרת התשובה לדיבור בעזרת gTTS
            print(f"===> Converting response to speech: {answer}")
            tts = gTTS(answer)
            tts.save("response.mp3")
            print("===> Saved response.mp3")

            # המרה ל-WAV מונו 8kHz בעזרת ffmpeg
            response_wav_path = "response.wav"
            print("===> Converting to WAV with ffmpeg")
            subprocess.run(["ffmpeg", "-y", "-i", "response.mp3", "-ar", "8000", "-ac", "1", "-acodec", "pcm_s16le", response_wav_path], check=True)
            print("===> Successfully converted response.wav")

            # ניקוי קבצים זמניים
            print("===> Cleaning up temporary files")
            os.remove("input.wav")
            os.remove("converted.wav")
            os.remove("response.mp3")

            # שליחת קובץ האודיו חזרה ללקוח
            print("===> Sending response.wav to client")
            return send_file(response_wav_path, mimetype="audio/wav")

        except subprocess.CalledProcessError as e:
            print(f"===> FFmpeg failed: {e}")
            return {"error": f"FFmpeg failed: {str(e)}"}, 500
        except Exception as e:
            print(f"===> General error: {e}")
            return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True)
