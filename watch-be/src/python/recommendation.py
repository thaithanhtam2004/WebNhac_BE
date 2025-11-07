import pandas as pd
import numpy as np
import json
import argparse
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine

# ==========================
# DATABASE CONFIG
# ==========================
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "musicWeb"
}

# ==========================
# CREATE SQLALCHEMY ENGINE
# ==========================
def get_engine():
    return create_engine(
        f"mysql+mysqlconnector://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}/{DB_CONFIG['database']}"
    )

# ==========================
# LOAD DATA
# ==========================
def load_data():
    engine = get_engine()
    songs = pd.read_sql("SELECT songId, title, singerId, genreId FROM Song", engine)
    features = pd.read_sql("SELECT * FROM SongFeature", engine)
    profile = pd.read_sql("SELECT * FROM UserTrendProfile", engine)
    history = pd.read_sql("SELECT userId, songId, listenCount FROM History", engine)

    # convert IDs to string
    for df, cols in [(songs, ["songId","singerId","genreId"]),
                     (features, ["songId","emotionId"]),
                     (profile, ["userId","singerId","emotionId"]),
                     (history, ["userId","songId"])]:
        for c in cols:
            if c in df.columns:
                df[c] = df[c].astype(str)

    return songs, features, profile, history

# ==========================
# BUILD SIMILARITY MATRICES
# ==========================
def build_similarity(songs, features):
    song_ids = songs.songId.tolist()

    # Audio similarity
    audio_cols = [c for c in features.columns if c not in ["songId","emotionId","createdAt"]]
    audio_matrix = features.set_index("songId").reindex(song_ids)[audio_cols].fillna(0).values
    norms = np.linalg.norm(audio_matrix, axis=1, keepdims=True)
    norms[norms==0] = 1
    audio_matrix = audio_matrix / norms
    sim_audio = cosine_similarity(audio_matrix)

    # Emotion similarity
    emo_series = features.set_index("songId").reindex(song_ids)["emotionId"].fillna("NA").values
    sim_emo = (emo_series[:, None] == emo_series[None, :]).astype(float)

    # Singer similarity
    singer_series = songs.set_index("songId").reindex(song_ids)["singerId"].fillna("NA").values
    sim_singer = (singer_series[:, None] == singer_series[None, :]).astype(float)

    # Genre similarity
    genre_series = songs.set_index("songId").reindex(song_ids)["genreId"].fillna("NA").values
    sim_genre = (genre_series[:, None] == genre_series[None, :]).astype(float)

    return song_ids, sim_audio, sim_emo, sim_singer, sim_genre

# ==========================
# RECOMMENDATION PER USER
# ==========================
def recommend(userId, songs, features, profile, history, top_k=20):
    song_ids, sim_audio, sim_emo, sim_singer, sim_genre = build_similarity(songs, features)
    listened = history[history.userId==userId]["songId"].tolist()
    if not listened:
        return []

    # ======================
    # Chuẩn hóa similarity
    # ======================
    sim_audio  = sim_audio / sim_audio.max() if sim_audio.max() > 0 else sim_audio
    sim_emo    = sim_emo / sim_emo.max()     if sim_emo.max() > 0 else sim_emo
    sim_singer = sim_singer / sim_singer.max() if sim_singer.max() > 0 else sim_singer
    sim_genre  = sim_genre / sim_genre.max() if sim_genre.max() > 0 else sim_genre

    idx_map = {s:i for i,s in enumerate(song_ids)}
    listen_idx = [idx_map[s] for s in listened if s in idx_map]

    # ======================
    # User profile weights (đa dạng hơn)
    # ======================
    user_prof = profile[profile.userId==userId]
    if user_prof.empty:
        w_audio, w_emotion, w_singer, w_genre = 0.2, 0.3, 0.25, 0.25
    else:
        w_emotion = user_prof.emotionWeight.mean() if "emotionWeight" in user_prof.columns else 0.3
        w_singer  = user_prof.singerWeight.mean() if "singerWeight" in user_prof.columns else 0.25
        w_audio   = 0.2
        w_genre   = max(0, 1 - (w_audio + w_emotion + w_singer))

    # ======================
    # Tính score trung bình cho mỗi bài
    # Loại bỏ bài đã nghe khỏi tính mean
    # ======================
    scores_audio = np.mean(sim_audio[listen_idx,:], axis=0)
    scores_emo   = np.mean(sim_emo[listen_idx,:], axis=0)
    scores_singer= np.mean(sim_singer[listen_idx,:], axis=0)
    scores_genre = np.mean(sim_genre[listen_idx,:], axis=0)

    # Weighted hybrid
    final_scores = w_audio*scores_audio + w_emotion*scores_emo + w_singer*scores_singer + w_genre*scores_genre

    # ======================
    # Trừ bài đã nghe
    # ======================
    for idx in listen_idx:
        final_scores[idx] = -1

    # ======================
    # Thêm noise nhỏ để break tie
    # ======================
    final_scores += np.random.rand(len(final_scores)) * 1e-5

    # Top-K recommendations
    top_idx = np.argsort(final_scores)[::-1][:top_k]
    recs = [{"songId": song_ids[i], "score": float(final_scores[i])} for i in top_idx]

    return recs


# ==========================
# MAIN
# ==========================
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--userId", required=True)
    args = parser.parse_args()

    songs, features, profile, history = load_data()
    recommendations = recommend(args.userId, songs, features, profile, history)

    # Trả JSON để Node.js parse
    print(json.dumps(recommendations))

    # ---- IN RA TOP 10 ----
    