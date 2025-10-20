const UserService = require("../../services/userService");


class UserController {
  // 🟢 Đăng ký
  async register(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email và mật khẩu là bắt buộc",
        });
      }

      const user = await UserService.register(req.body);
      res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        data: user,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Đăng ký thất bại",
      });
    }
  }


  // 🟢 Đăng nhập
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email và mật khẩu là bắt buộc",
        });
      }

      const result = await UserService.login({ email, password });
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.user,
        token: result.token, // Gửi token về client
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        message: err.message || "Đăng nhập thất bại",
      });
    }
  }

  // 🟢 Lấy thông tin người dùng theo ID
  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        message: err.message || "Không tìm thấy người dùng",
      });
    }
  }

  // 🟢 Cập nhật thông tin người dùng
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const success = await UserService.updateUser(id, req.body);
      res.status(200).json({
        success: true,
        message: success.message || "Cập nhật thành công",
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Cập nhật thất bại",
      });
    }
  }

  // 🟢 Đổi mật khẩu
  async changePassword(req, res) {
    try {
      const { user_id, oldPassword, newPassword } = req.body;
      if (!user_id || !oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin đổi mật khẩu",
        });
      }

      const result = await UserService.changePassword(
        user_id,
        oldPassword,
        newPassword
      );
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Đổi mật khẩu thất bại",
      });
    }
  }

  // 🟢 Xóa (hoặc vô hiệu hóa) người dùng
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Xóa thất bại",
      });
    }
  }

  // 🟢 Lấy danh sách tất cả người dùng
  async getAllUsers(req, res) {
    try {
      const list = await UserService.getAllUsers();
      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Không thể lấy danh sách người dùng",
      });
    }
  }
}

module.exports = new UserController;