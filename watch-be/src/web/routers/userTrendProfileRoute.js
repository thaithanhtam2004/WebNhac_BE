const express = require("express");
const router = express.Router();
const UserTrendProfileController = require("../controller/userTrendProfileController");

// POST /api/user-trend-profile  → tạo hoặc upsert profile
router.post("/", UserTrendProfileController.upsert);

// PUT /api/user-trend-profile/weights  → cập nhật trọng số
router.put("/weights", UserTrendProfileController.updateWeights);

module.exports = router;
