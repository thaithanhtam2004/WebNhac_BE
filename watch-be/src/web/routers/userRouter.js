const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");

// Public routes
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// Protected routes (thêm authMiddleware sau)
router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.update);
router.put("/:id/change-password", UserController.changePassword);

// ✅ Route này khớp với frontend: PATCH /api/users/:userId/status
router.patch("/:id/status", UserController.updateStatus);

// Giữ lại routes riêng lẻ nếu cần
router.delete("/:id", UserController.disable);
router.patch("/:id/enable", UserController.enable);

module.exports = router;