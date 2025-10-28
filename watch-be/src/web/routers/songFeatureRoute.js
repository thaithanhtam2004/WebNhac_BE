const express = require("express");
const router = express.Router();
const SongFeatureController = require("../controller/songFeatureController");
const upload = require("../middlewares/upload");

// ✅ POST /api/features/analyze — nhận file audio từ client
router.post(
  "/analyze",
  upload.single("file"), // middleware xử lý file upload
  SongFeatureController.analyze
);

// ✅ GET /api/features/:songId
router.get("/:songId", SongFeatureController.getBySongId);

module.exports = router;
