import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime
import json
import sys

# ===== Cấu hình DB =====
DB_URI = "mysql+pymysql://root:root@localhost:3306/musicWeb"
engine = create_engine(DB_URI)

# ===== 1. Load dữ liệu =====
songs = pd.read_sql("SELECT songId, singerId, genreId FROM Song", engine)
song_emotions = pd.read_sql("SELECT * FROM Song_Emotion", engine)
song_genres = pd.read_sql("SELECT * FROM SongGenre", engine)
history = pd.read_sql("SELECT * FROM History", engine)
favorite = pd.read_sql("SELECT * FROM Favorite", engine)

# ===== 2. Tạo mapping =====
user_listened = history.groupby("userId")["songId"].apply(set).to_dict()
user_favorites = favorite.groupby("userId")["songId"].apply(set).to_dict()
song_emotion_map = song_emotions.groupby("songId")["emotionId"].apply(set).to_dict()
song_genre_map = song_genres.groupby("songId")["genreId"].apply(set).to_dict()

# ===== 3. Item-based similarity =====
WEIGHT_EMOTION = 1.0
WEIGHT_GENRE = 0.5
WEIGHT_SINGER = 0.8

song_similarity = {}
for i, song_i in songs.iterrows():
    sim_dict = {}
    emotions_i = song_emotion_map.get(song_i["songId"], set())
    genres_i = song_genre_map.get(song_i["songId"], set())
    singer_i = song_i["singerId"]
    for j, song_j in songs.iterrows():
        if song_i["songId"] == song_j["songId"]:
            continue
        emotions_j = song_emotion_map.get(song_j["songId"], set())
        genres_j = song_genre_map.get(song_j["songId"], set())
        singer_j = song_j["singerId"]
        sim = (len(emotions_i & emotions_j) * WEIGHT_EMOTION +
               len(genres_i & genres_j) * WEIGHT_GENRE)
        if singer_i == singer_j:
            sim += WEIGHT_SINGER
        if sim > 0:
            sim_dict[song_j["songId"]] = sim
    song_similarity[song_i["songId"]] = sim_dict

# ===== 4. Adaptive weights cho user =====
adaptive_weights = {}  # user_id -> {"singer": {}, "genre": {}, "emotion": {}}

def init_user_weights(user_id):
    if user_id not in adaptive_weights:
        adaptive_weights[user_id] = {"singer": {}, "genre": {}, "emotion": {}}

def update_user_weights(user_id, song, alpha=0.05):
    init_user_weights(user_id)
    w = adaptive_weights[user_id]
    
    # Singer
    singer_id = song["singerId"]
    w["singer"][singer_id] = w["singer"].get(singer_id, 0.1) + alpha
    
    # Genre
    genre_id = song["genreId"]
    w["genre"][genre_id] = w["genre"].get(genre_id, 0.1) + alpha
    
    # Emotions
    for e in song_emotion_map.get(song["songId"], set()):
        w["emotion"][e] = w["emotion"].get(e, 0.1) + alpha

# ===== 5. Compute score dùng adaptive weights =====
def compute_score_adaptive(user_id, song):
    init_user_weights(user_id)
    w = adaptive_weights[user_id]
    
    score = 0.0
    score += w["singer"].get(song["singerId"], 0) * 0.4
    score += w["genre"].get(song["genreId"], 0) * 0.2
    for e in song_emotion_map.get(song["songId"], set()):
        score += w["emotion"].get(e, 0) * 0.3
    
    # Favorite
    if user_id in user_favorites and song["songId"] in user_favorites[user_id]:
        score += 0.1
    
    # Item similarity
    listened = user_listened.get(user_id, set())
    for s in listened:
        score += song_similarity.get(s, {}).get(song["songId"], 0) * 0.05
    
    return score

# ===== 6. Realtime: user nghe bài mới =====
def user_listened_song(user_id, song_id):
    # Update lịch sử
    if user_id not in user_listened:
        user_listened[user_id] = set()
    user_listened[user_id].add(song_id)
    
    song = songs.loc[songs["songId"] == song_id].iloc[0]
    
    # Cập nhật trọng số thích nghi
    update_user_weights(user_id, song)
    
    # Cập nhật recommendation realtime
    update_recommendation_for_user(user_id)

# ===== 7. Realtime incremental recommendation =====
def update_recommendation_for_user(user_id):
    listened = user_listened.get(user_id, set())
    user_scores = []
    for _, song in songs.iterrows():
        if song["songId"] in listened:
            continue
        s = compute_score_adaptive(user_id, song)
        if s > 0:
            user_scores.append((song["songId"], s))
    # Top 20
    top_k = sorted(user_scores, key=lambda x: x[1], reverse=True)[:20]
    recommendations = []
    for song_id, score in top_k:
        recommendations.append({
            "userId": user_id,
            "songId": song_id,
            "score": score,
            "generatedAt": datetime.now().isoformat()
        })
        # Lưu vào DB
        engine.execute("""
            INSERT INTO UserRecommendation(userId, songId, score, generatedAt)
            VALUES (%s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE score=%s, generatedAt=NOW()
        """, (user_id, song_id, score, score))
    print(json.dumps(recommendations), flush=True)
    print(f"✅ Realtime recommendation updated for user {user_id}", file=sys.stderr)

# ===== 8. Batch: tất cả user =====
def run_batch():
    recommendations = []
    for user_id in user_listened.keys():
        listened = user_listened.get(user_id, set())
        user_scores = []
        for _, song in songs.iterrows():
            if song["songId"] in listened:
                continue
            s = compute_score_adaptive(user_id, song)
            if s > 0:
                user_scores.append((song["songId"], s))
        top_k = sorted(user_scores, key=lambda x: x[1], reverse=True)[:20]
        for song_id, score in top_k:
            recommendations.append({
                "userId": user_id,
                "songId": song_id,
                "score": score,
                "generatedAt": datetime.now().isoformat()
            })
    rec_df = pd.DataFrame(recommendations)
    rec_df.to_sql("UserRecommendation", engine, if_exists="replace", index=False)
    print(json.dumps(recommendations), flush=True)
    print("✅ Batch UserRecommendation updated!", file=sys.stderr)

# ===== 9. Ví dụ realtime =====
# user_listened_song("user_1", "song_123")
