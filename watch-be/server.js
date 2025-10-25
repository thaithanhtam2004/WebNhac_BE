require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// ⚙️ Config môi trường
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST_NAME || "localhost";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 🧭 Import routers
const userRouter = require("./src/web/routers/userRouter");
const albumRouter = require("./src/web/routers/albumRouter");
const albumSongRouter = require("./src/web/routers/albumSongRoute");
const singerRouter = require("./src/web/routers/singerRouter");
const genreRouter = require("./src/web/routers/genreRoute");
const songGenreRouter = require("./src/web/routers/songGenreRouter");
const featureRouter = require("./src/web/routers/songFeatureRoute");
const songRouter = require("./src/web/routers/songRouter");
const playlistRouter = require("./src/web/routers/playlistRouter");
const favoriteRouter = require("./src/web/routers/favoriteRouter");
const historyRouter = require("./src/web/routers/historyRouter");
const userTrendProfileRouter = require("./src/web/routers/userTrendProfileRoute");

// 🛠️ Dùng routes
app.use("/api/users", userRouter);
app.use("/api/albums", albumRouter); // CRUD album
app.use("/api/albumsSong", albumSongRouter); // Bài hát trong album
app.use("/api/singers", singerRouter);
app.use("/api/genres", genreRouter);
app.use("/api/song-genres", songGenreRouter);
app.use("/api/features", featureRouter);
app.use("/api/songs", songRouter);
app.use("/api/playlists", playlistRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/history", historyRouter);
app.use("/api/trend", userTrendProfileRouter);

// Route test
app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 API Music Server đang hoạt động!" });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
});

// Chạy server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server chạy tại: http://${HOST}:${PORT}`);
});
