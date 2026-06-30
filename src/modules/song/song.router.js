// routes/song.js
const express = require("express");
const router = express.Router();
const SongController = require("./song.controller");
const upload = require("../../middlewares/upload");
const authMiddleware = require("../../middlewares/authMiddleware");
const isAdmin = require("../../middlewares/isAdmin");
const viewLimiter = require("../../middlewares/viewLimiter");

// ⚠️ Các route cụ thể phải đứng TRƯỚC /:id để tránh bị bắt nhầm
router.get("/search/all",       SongController.searchAll);
router.get("/all/latest",       SongController.getSongByReleaseDate);
router.get("/hotTrend",         SongController.getHotTrend);
router.get("/with-feature/all", SongController.getAllWithFeature);
router.get("/singer/:singerId", SongController.getBySinger);
router.get("/genre/:genreId",   SongController.getByGenre);

// 🔒 Bulk operations — Admin only
router.post("/bulk-delete",      authMiddleware, isAdmin, SongController.bulkDelete);
router.post("/bulk-visibility",  authMiddleware, isAdmin, SongController.bulkToggleVisibility);

// CRUD — GET public, write Admin only
router.get("/",    SongController.getAll);
router.get("/:id", SongController.getById);
router.post("/:id/view", viewLimiter, SongController.increaseView);                           // public (rate limited)
router.delete("/:id",    authMiddleware, isAdmin, SongController.delete);        // 🔒 Admin
router.patch("/:id/visibility", authMiddleware, isAdmin, SongController.toggleVisibility); // 🔒 Admin

router.post(
  "/",
  authMiddleware, isAdmin,
  upload.fields([
    { name: "file",  maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  SongController.create
);

router.put(
  "/:id",
  authMiddleware, isAdmin,
  upload.fields([
    { name: "file",  maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  SongController.update
);

module.exports = router;