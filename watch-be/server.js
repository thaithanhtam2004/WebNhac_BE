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
const userRouter = require("./src/web/routers/userRouter");
const albumRoutes = require("./src/web/routers/albumRouter");
const albumSongRouter = require("./src/web/routers/albumSongRoute");
const singerRoutes = require("./src/web/routers/singerRouter");
const genreRoutes = require("./src/web/routers/genreRoute");
const songGenreRoutes = require("./src/web/routers/songGenreRouter");
const featureRoutes = require("./src/web/routers/songFeatureRoute");
const songRouter = require("./src/web/routers/songRouter");
const playlistRouter = require("./src/web/routers/playlistRouter");
const favoriteRouter = require("./src/web/routers/favoriteRouter");
const historyRouter = require("./src/web/routers/historyRouter");
const UserTrendProfile = require("./src/web/routers/userTrendProfileRoute");
const recommendation = require("./src/web/routers/userRecommendationRoute");
const emotion = require("./src/web/routers/emotionRoutes");
const otpRouter = require("./src/web/routers/otpRouter");
const playlistSong = require("./src/web/routers/playlistSongRoute");

// 🛠️ Dùng routes
app.use("/api/users", userRouter);
app.use("/api/albums", albumRoutes);
app.use("/api/albums", albumSongRouter);
app.use("/api/users", otpRouter);

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
