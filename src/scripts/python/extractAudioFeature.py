import sys
import json
import librosa
import numpy as np

def extract_audio_features(file_path):
    y, sr = librosa.load(file_path, sr=None)

    # Tempo
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    tempo = np.array(tempo).item()  # scalar an toàn

    # Loudness
    rms = librosa.feature.rms(y=y)
    loudness_db = float(20 * np.log10(np.mean(rms) + 1e-6))

    # Energy
    spectral_flux = np.mean(librosa.onset.onset_strength(y=y, sr=sr))
    energy = float(np.mean(rms) * spectral_flux)

    # Harmonic / Percussive
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    instrumentalness = float(np.mean(np.abs(y_harmonic)) / (np.mean(np.abs(y)) + 1e-6))
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    beat_std = np.std(onset_env).item()
    danceability = float(np.clip(tempo / 200 * (1 - beat_std), 0, 1))
    speechiness = float(np.mean(np.abs(y_percussive)) / (np.mean(np.abs(y)) + 1e-6))
    acousticness = float(np.mean(np.abs(y_harmonic)) / (np.mean(np.abs(y)) + 1e-6))

    return {
        "tempo_bpm": tempo,
        "loudness_db": loudness_db,
        "energy": energy,
        "instrumentalness": instrumentalness,
        "danceability": danceability,
        "speechiness": speechiness,
        "acousticness": acousticness
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Thiếu file_path"}))
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        features = extract_audio_features(file_path)
        print(json.dumps(features))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
