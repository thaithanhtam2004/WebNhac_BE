const jwt = require("jsonwebtoken");
const UserService = require("../../services/userService");

class UserController {
  // 🟢 Đăng ký
  async register(req, res) {
    try {
      const result = await UserService.register(req.body);
      res.status(201).json({
        success: true,
        message: result.message,
        userId: result.userId,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Đăng nhập (có token)
  async login(req, res) {
    try {
      const user = await UserService.login(req.body);

      // 🧩 Tạo token
      const token = jwt.sign(
        { userId: user.userId, email: user.email, roleId: user.roleId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: { ...user, token },
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Lấy tất cả user
  async getAll(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 🟢 Lấy user theo ID
  async getById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  // 🟡 Cập nhật thông tin
  async update(req, res) {
    try {
      const result = await UserService.updateUser(req.params.id, req.body);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟡 Đổi mật khẩu
  async changePassword(req, res) {
    try {
      const result = await UserService.changePassword(req.params.id, req.body);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🔴 Vô hiệu hóa
  async disable(req, res) {
    try {
      const result = await UserService.disableUser(req.params.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Kích hoạt lại
  async enable(req, res) {
    try {
      const result = await UserService.enableUser(req.params.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // ✅ Toggle status (enable/disable)
  async updateStatus(req, res) {
    try {
      const { isActive } = req.body;
      const userId = req.params.id;

      if (isActive === undefined || isActive === null) {
        return res
          .status(400)
          .json({ success: false, message: "isActive là bắt buộc" });
      }

      let result;
      if (isActive === false) {
        result = await UserService.disableUser(userId);
      } else if (isActive === true) {
        result = await UserService.enableUser(userId);
      } else {
        return res
          .status(400)
          .json({ success: false, message: "isActive phải là true hoặc false" });
      }

      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new UserController();
