import sys
import json
import librosa
import numpy as np

def extract_features(file_path):
    y, sr = librosa.load(file_path, sr=None)
    
    # 1. Tempo & Beats
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    totalBeats = len(beats)
    averageBeats = totalBeats / (len(y)/sr) * 60  # approximation BPM
    
    # 2. Chroma features
    chromaStft = librosa.feature.chroma_stft(y=y, sr=sr)
    chromaCq = librosa.feature.chroma_cqt(y=y, sr=sr)
    chromaCens = librosa.feature.chroma_cens(y=y, sr=sr)
    
    # 3. MFCC
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    mfccDelta = librosa.feature.delta(mfcc)
    
    # 4. RMS / energy
    rmse = librosa.feature.rms(y=y)
    
    # 5. Spectral
    cent = librosa.feature.spectral_centroid(y=y, sr=sr)
    specBw = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    
    # 6. Tonnetz (harmonic features)
    yHarmonic = librosa.effects.harmonic(y)
    tonnetz = librosa.feature.tonnetz(y=yHarmonic, sr=sr)
    
    # 7. Zero crossing rate
    zcr = librosa.feature.zero_crossing_rate(y)
    
    # 8. Harmonic / Percussive
    yHarm, yPerc = librosa.effects.hpss(y)
    
    # 9. Frame-wise energy
    frameEnergy = np.square(y).reshape(-1, 1024).mean(axis=1)
    
    # Tính thống kê mean, std, var
    features = {
        "tempo": float(tempo),
        "totalBeats": int(totalBeats),
        "averageBeats": float(averageBeats),
        
        "chromaStftMean": float(np.mean(chromaStft)),
        "chromaStftStd": float(np.std(chromaStft)),
        "chromaStftVar": float(np.var(chromaStft)),
        
        "chromaCqMean": float(np.mean(chromaCq)),
        "chromaCqStd": float(np.std(chromaCq)),
        "chromaCqVar": float(np.var(chromaCq)),
        
        "chromaCensMean": float(np.mean(chromaCens)),
        "chromaCensStd": float(np.std(chromaCens)),
        "chromaCensVar": float(np.var(chromaCens)),
        
        "mfccMean": float(np.mean(mfcc)),
        "mfccStd": float(np.std(mfcc)),
        "mfccVar": float(np.var(mfcc)),
        "mfccDeltaMean": float(np.mean(mfccDelta)),
        "mfccDeltaStd": float(np.std(mfccDelta)),
        "mfccDeltaVar": float(np.var(mfccDelta)),
        
        "rmseMean": float(np.mean(rmse)),
        "rmseStd": float(np.std(rmse)),
        "rmseVar": float(np.var(rmse)),
        
        "centMean": float(np.mean(cent)),
        "centStd": float(np.std(cent)),
        "centVar": float(np.var(cent)),
        
        "specBwMean": float(np.mean(specBw)),
        "specBwStd": float(np.std(specBw)),
        "specBwVar": float(np.var(specBw)),
        
        "contrastMean": float(np.mean(contrast)),
        "contrastStd": float(np.std(contrast)),
        "contrastVar": float(np.var(contrast)),
        
        "rolloffMean": float(np.mean(rolloff)),
        "rolloffStd": float(np.std(rolloff)),
        "rolloffVar": float(np.var(rolloff)),
        
        "tonnetzMean": float(np.mean(tonnetz)),
        "tonnetzStd": float(np.std(tonnetz)),
        "tonnetzVar": float(np.var(tonnetz)),
        
        "zcrMean": float(np.mean(zcr)),
        "zcrStd": float(np.std(zcr)),
        "zcrVar": float(np.var(zcr)),
        
        "harmMean": float(np.mean(yHarm)),
        "harmStd": float(np.std(yHarm)),
        "harmVar": float(np.var(yHarm)),
        
        "percMean": float(np.mean(yPerc)),
        "percStd": float(np.std(yPerc)),
        "percVar": float(np.var(yPerc)),
        
        "frameMean": float(np.mean(frameEnergy)),
        "frameStd": float(np.std(frameEnergy)),
        "frameVar": float(np.var(frameEnergy))
    }
    
    return features

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Thiếu file_path"}))
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        features = extract_features(file_path)
        print(json.dumps(features, indent=4))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
