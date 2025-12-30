const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController"); 

// Public
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// Protected (Nhớ thêm middleware auth sau này)
router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.update);
router.put("/:id/change-password", UserController.changePassword);

// ✅ Route linh hoạt cho Frontend
router.patch("/:id/status", UserController.updateStatus);

// ✅ Route Vô hiệu hóa (Soft Delete) - Gọi hàm disable trong Controller
router.delete("/:id", UserController.disable);

// ✅ Route Mở khóa - Gọi hàm enable trong Controller
router.patch("/:id/enable", UserController.enable);

module.exports = router;