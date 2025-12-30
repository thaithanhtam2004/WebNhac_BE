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

    # ======================
    # 1. Lấy lịch sử nghe
    # ======================
    user_hist = history[history.userId == userId]
    if user_hist.empty:
        return []

    listened_songs = user_hist.songId.tolist()
    listen_map = dict(zip(user_hist.songId, user_hist.listenCount))

    idx_map = {s:i for i,s in enumerate(song_ids)}
    listened_idx = [idx_map[s] for s in listened_songs if s in idx_map]

    # ======================
    # 2. Lấy PROFILE – KHÔNG DÙNG MEAN
    # ======================
    user_prof = profile[profile.userId == userId]
    if user_prof.empty:
        return []

    # Ưu tiên các cặp Singer–Emotion mạnh nhất
    top_pairs = user_prof.sort_values(
        by=["likeWeight", "emotionWeight", "singerWeight", "listenCount"],
        ascending=False
    ).head(5)

    # ======================
    # 3. Chuẩn bị dữ liệu bài hát
    # ======================
    song_meta = songs.merge(
        features[["songId", "emotionId"]],
        on="songId",
        how="left"
    )

    # ======================
    # 4. TÍNH SCORE THEO CẶP (Singer, Emotion)
    # ======================
    final_scores = np.zeros(len(song_ids))

    for _, row in top_pairs.iterrows():
        singerId  = row.singerId
        emotionId = row.emotionId

        # trọng số profile
        w_like    = row.likeWeight
        w_emotion = row.emotionWeight
        w_singer  = row.singerWeight

        profile_weight = (
            0.5 * w_like +
            0.3 * w_emotion +
            0.2 * w_singer
        )

        # các bài khớp cặp singer + emotion
        mask = (
            (song_meta.singerId == singerId) &
            (song_meta.emotionId == emotionId)
        )

        idxs = [idx_map[s] for s in song_meta[mask].songId if s in idx_map]

        if not idxs:
            continue

        # ======================
        # 5. AUDIO SIMILARITY (PHỤ)
        # ======================
        audio_sim_score = np.mean(sim_audio[listened_idx][:, idxs], axis=0)

        # ======================
        # 6. CỘNG ĐIỂM
        # ======================
        for i, song_idx in enumerate(idxs):
            final_scores[song_idx] += profile_weight * (0.7 + 0.3 * audio_sim_score[i])

    # ======================
    # 7. Loại bài đã nghe
    # ======================
    for s in listened_songs:
        if s in idx_map:
            final_scores[idx_map[s]] = -1

    # ======================
    # 8. Noise nhẹ
    # ======================
    final_scores += np.random.rand(len(final_scores)) * 1e-6

    # ======================
    # 9. Top-K
    # ======================
    top_idx = np.argsort(final_scores)[::-1][:top_k]

    return [
        {"songId": song_ids[i], "score": float(final_scores[i])}
        for i in top_idx if final_scores[i] > 0
    ]


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
    