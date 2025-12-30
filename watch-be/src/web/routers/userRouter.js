const express = require("express");
const router = express.Router();

const UserController = require("../controller/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");

// ==================
// 🌍 PUBLIC ROUTES
// ==================
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// ==================
// 🔒 ADMIN ONLY
// ==================
router.get("/", authMiddleware, isAdmin, UserController.getAll);

router.patch(
  "/:id/status",
  authMiddleware,
  isAdmin,
  UserController.updateStatus
);

router.delete("/:id", authMiddleware, isAdmin, UserController.disable);
router.patch("/:id/enable", authMiddleware, isAdmin, UserController.enable);

// ==================
// 🔐 USER ĐÃ ĐĂNG NHẬP
// ==================
router.get("/:id", authMiddleware, UserController.getById);
router.put("/:id", authMiddleware, UserController.update);
router.put(
  "/:id/change-password",
  authMiddleware,
  UserController.changePassword
);

module.exports = router;
