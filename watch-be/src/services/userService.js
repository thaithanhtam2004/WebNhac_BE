// services/userService.js
const bcrypt = require("bcrypt");

const { ulid } = require("ulid");
const UserRepository = require("../infras/repositories/userRepository");

const UserService = {
  // 🟢 Lấy tất cả user (Admin only)
  async getAllUsers() {
    return await UserRepository.findAll();
  },

  // 🟢 Lấy user theo ID
  async getUserById(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");
    return user;
  },

  // 🟢 Đăng ký
  async register(data) {
    const { name, email, phone, password } = data;

    if (!name || !email || !password) {
      throw new Error("Vui lòng nhập đầy đủ thông tin");
    }

    const exists = await UserRepository.existsByEmail(email);
    if (exists) throw new Error("Email đã được sử dụng");

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = ulid();

    await UserRepository.create({
      userId,
      name,
      email,
      phone,
      password: hashedPassword,
      roleId: data.roleId || null,
    });

    return { message: "Đăng ký thành công", userId };
  },

  async login({ email, password }) {
    const user = await UserRepository.findByEmail(email);

    if (!user) throw new Error("Email hoặc mật khẩu không đúng");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Email hoặc mật khẩu không đúng");

    if (!user.isActive) throw new Error("Tài khoản đã bị vô hiệu hóa");

    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  // 🟡 Cập nhật thông tin user
  async updateUser(userId, data) {
    const existing = await UserRepository.findById(userId);
    if (!existing) throw new Error("Người dùng không tồn tại");

    const success = await UserRepository.update(userId, data);
    if (!success) throw new Error("Cập nhật thất bại");

    return { message: "Cập nhật người dùng thành công" };
  },

  // 🟡 Đổi mật khẩu
  async changePassword(userId, { oldPassword, newPassword }) {
    const user = await UserRepository.findByEmail(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new Error("Mật khẩu cũ không đúng");

    const hashed = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(userId, hashed);

    return "Mã OTP đã được gửi qua email.";
  },

  // 🔴 Vô hiệu hóa user
  async disableUser(userId) {
    const success = await UserRepository.disable(userId);
    if (!success) throw new Error("Không tìm thấy người dùng");
    return { message: "Đã vô hiệu hóa người dùng" };
  },

  // 🟢 Kích hoạt lại user
  async enableUser(userId) {
    const success = await UserRepository.enable(userId);
    if (!success) throw new Error("Không tìm thấy người dùng");
    return { message: "Đã kích hoạt người dùng" };
  },
};

module.exports = UserService;
