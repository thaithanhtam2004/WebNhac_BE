const UserService = require("../../services/userService");

class UserController {
  async register(req, res) {
    try {
      const result = await UserService.register(req.body);
      res.status(201).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async login(req, res) {
    try {
      const token = await UserService.login(req.body);
      res.status(200).json({ success: true, token });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Gửi OTP quên mật khẩu
  async forgotPassword(req, res) {
    try {
      const result = await UserService.forgotPassword(req.body.email);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Xác thực OTP và reset mật khẩu
  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await UserService.resetPassword(email, otp, newPassword);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const users = await UserService.getAllUsers(req.user);
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      res.status(403).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async changePassword(req, res) {
    try {
      const result = await UserService.changePassword(req.params.id, req.body);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async disable(req, res) {
    try {
      const result = await UserService.disableUser(req.params.id, req.user);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new UserController();
