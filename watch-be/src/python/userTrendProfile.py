import mysql.connector
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# ==========================
# DATABASE CONFIG
# ==========================
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "musicWeb"
}

def connect_db():
    return mysql.connector.connect(**DB_CONFIG)

# ==========================
# LOAD DATA
# ==========================
def load_data():
    conn = connect_db()
    print("📥 Loading data...")

    songs = pd.read_sql("SELECT songId, title, singerId, genreId FROM Song", conn)
    history = pd.read_sql("SELECT userId, songId, listenCount FROM History", conn)
    features = pd.read_sql("SELECT * FROM SongFeature", conn)
    profile = pd.read_sql("SELECT * FROM UserTrendProfile", conn)

    conn.close()
    # Ensure IDs are strings
    for df, cols in [(songs, ["songId","singerId","genreId"]),
                     (history, ["userId","songId"]),
                     (features, ["songId","emotionId"]),
                     (profile, ["userId","singerId","emotionId"])]:
        for c in cols:
            if c in df.columns:
                df[c] = df[c].astype(str)
    return songs, history, features, profile

# ==========================
# BUILD ITEM SIMILARITY
# ==========================
def build_item_similarity(songs, features):
    song_ids = songs.songId.tolist()
    n = len(song_ids)

    # --- Audio similarity ---
    audio_cols = [c for c in features.columns if c not in ["songId","emotionId","createdAt"]]
    audio_matrix = features.set_index("songId").reindex(song_ids)[audio_cols].fillna(0).values
    norms = np.linalg.norm(audio_matrix, axis=1, keepdims=True)
    norms[norms==0] = 1
    audio_matrix = audio_matrix / norms
    sim_audio = cosine_similarity(audio_matrix)

    # --- Emotion similarity ---
    emotion_series = features.set_index("songId").reindex(song_ids)["emotionId"].fillna("NA").values
    sim_emotion = (emotion_series[:, None] == emotion_series[None, :]).astype(float)

    # --- Singer similarity ---
    singer_series = songs.set_index("songId").reindex(song_ids)["singerId"].fillna("NA").values
    sim_singer = (singer_series[:, None] == singer_series[None, :]).astype(float)

    # --- Genre similarity ---
    genre_series = songs.set_index("songId").reindex(song_ids)["genreId"].fillna("NA").values
    sim_genre = (genre_series[:, None] == genre_series[None, :]).astype(float)

    print(f"🎵 Item similarity built for {n} songs")
    return song_ids, sim_audio, sim_emotion, sim_singer, sim_genre

# ==========================
# RECOMMENDATION PER USER
# ==========================
def recommend_for_user(userId, history, songs, song_ids,
                       sim_audio, sim_emotion, sim_singer, sim_genre, profile, top_k=20):
    listened = history[history.userId==userId]["songId"].tolist()
    if not listened:
        return pd.DataFrame(columns=["songId","score"])

    # Get user profile weights
    user_prof = profile[profile.userId==userId]
    if user_prof.empty:
        # fallback weights
        w_audio, w_emotion, w_singer, w_genre = 0.5, 0.2, 0.15, 0.15
    else:
        # Average weights across profile entries
        w_emotion = user_prof.emotionWeight.mean()
        w_singer  = user_prof.singerWeight.mean()
        w_like    = user_prof.likeWeight.mean()
        w_audio   = 0.5  # fix audio weight
        # make genre weight as remaining
        w_genre = max(0.0, 1 - (w_audio + w_emotion + w_singer))
    
    # Align listened songs in song_ids
    valid_listened = [s for s in listened if s in song_ids]
    if not valid_listened:
        return pd.DataFrame(columns=["songId","score"])

    # Get indices
    idx_map = {song:i for i,song in enumerate(song_ids)}
    listen_idx = [idx_map[s] for s in valid_listened]

    # Compute mean similarity for all songs
    scores_audio = sim_audio[listen_idx,:].mean(axis=0)
    scores_emotion = sim_emotion[listen_idx,:].mean(axis=0)
    scores_singer = sim_singer[listen_idx,:].mean(axis=0)
    scores_genre  = sim_genre[listen_idx,:].mean(axis=0)

    # Weighted hybrid score
    final_scores = w_audio*scores_audio + w_emotion*scores_emotion + w_singer*scores_singer + w_genre*scores_genre

    # Remove already listened
    for s in valid_listened:
        final_scores[idx_map[s]] = -1

    # Top-K
    top_idx = np.argsort(final_scores)[::-1][:top_k]
    rec_songs = [song_ids[i] for i in top_idx]
    rec_scores = [final_scores[i] for i in top_idx]

    return pd.DataFrame({"songId": rec_songs, "score": rec_scores})

# ==========================
# SAVE RECOMMENDATIONS
# ==========================
def save_recommendations(userId, rec_df):
    if rec_df.empty:
        return
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM UserRecommendation WHERE userId=%s",(userId,))
    sql = "REPLACE INTO UserRecommendation (userId,songId,score,generatedAt) VALUES (%s,%s,%s,NOW())"
    values = [(userId,row.songId,float(row.score)) for row in rec_df.itertuples(index=False)]
    cur.executemany(sql, values)
    conn.commit()
    cur.close()
    conn.close()

# ==========================
# MAIN PIPELINE
# ==========================
def generate_recommendations():
    songs, history, features, profile = load_data()
    if songs.empty or history.empty:
        print("No data to process")
        return

    print("⚙ Building item similarity...")
    song_ids, sim_audio, sim_emotion, sim_singer, sim_genre = build_item_similarity(songs, features)

    users = history.userId.unique()
    print("🚀 Generating recommendations...")
    for uid in users:
        rec = recommend_for_user(uid, history, songs, song_ids,
                                 sim_audio, sim_emotion, sim_singer, sim_genre, profile)
        save_recommendations(uid, rec)
        print(f"✅ Done {uid} ({len(rec)} recs)")

    print("🎯 All recommendations completed!")

if __name__ == "__main__":
    generate_recommendations()
