require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

// 🧩 Cấu hình CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ⚙️ Config môi trường
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST_NAME || "localhost";

// 📦 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🧭 Import routers
const userRouter = require("./src/modules/user/user.router");
const albumRoutes = require("./src/modules/album/album.router");
const albumSongRouter = require("./src/modules/album/albumSong.router");
const singerRoutes = require("./src/modules/singer/singer.router");
const genreRoutes = require("./src/modules/genre/genre.router");
const songGenreRoutes = require("./src/modules/genre/songGenre.router");
const featureRoutes = require("./src/modules/song/songFeature.router");
const songRouter = require("./src/modules/song/song.router");
const playlistRouter = require("./src/modules/playlist/playlist.router");
const favoriteRouter = require("./src/modules/favorite/favorite.router");
const historyRouter = require("./src/modules/history/history.router");
const UserTrendProfile = require("./src/modules/recommendation/userTrend.router");
const recommendation = require("./src/modules/recommendation/recommendation.router");
const emotion = require("./src/modules/emotion/emotion.router");
const otpRouter = require("./src/modules/user/otp.router");

const playlistSong = require("./src/modules/playlist/playlistSong.router");

// 🛠️ Dùng routes
app.use("/api/users", userRouter);
app.use("/api/users", otpRouter);
app.use("/api/albums", albumRoutes);
app.use("/api/albums", albumSongRouter);

app.use("/api/singers", singerRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/song-genres", songGenreRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/songs", songRouter);
app.use("/api/playlists", playlistRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/history", historyRouter);
app.use("/api/trend", UserTrendProfile);
app.use("/api/recommend", recommendation);
app.use("/api/emotions", emotion);

app.use("/api/playlistSong", playlistRouter);

// 🚀 Route test
app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 API Music Server đang hoạt động!" });
});

// ⚠️ Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
});

// ✅ Tạo HTTP server
const http = require("http");
const server = http.createServer(app);

// ✅ IMPORT SOCKET
const { initSocket } = require("./src/utils/socket");

// ✅ INIT WEBSOCKET
initSocket(server);

// 🏁 Chạy server
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server chạy tại: http://${HOST}:${PORT}`);
  console.log(`⚡ WebSocket: ws://${HOST}:${PORT}`);
});
