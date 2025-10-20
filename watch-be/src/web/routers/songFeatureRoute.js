const express = require("express");
const router = express.Router();
const SongFeatureController = require("../controller/songFeatureController");

// POST /api/features/analyze
router.post("/analyze", SongFeatureController.analyze);

// GET /api/features/:songId
router.get("/:songId", SongFeatureController.getBySongId);

module.exports = router;
