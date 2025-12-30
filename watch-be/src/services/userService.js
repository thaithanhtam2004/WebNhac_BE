const bcrypt = require("bcrypt");
const { ulid } = require("ulid");
const UserRepository = require("../infras/repositories/userRepository");

const UserService = {
  async getAllUsers() { return await UserRepository.findAll(); },

  async getUserById(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");
    return user;
  },

  async register(data) {
    const { name, email, phone, password, roleId } = data;
    if (!name || !email || !password) throw new Error("Thiếu thông tin bắt buộc");
    
    const exists = await UserRepository.existsByEmail(email);
    if (exists) throw new Error("Email đã được sử dụng");

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = ulid();

    // ✅ TỰ ĐỘNG GÁN ROLE USER
    const USER_ROLE_ID = 1;

    await UserRepository.create({
      userId,
      name,
      email,
      phone,
      password: hashedPassword,
      roleId: USER_ROLE_ID,
      isActive: 1,
    });

    return {
      message: "Đăng ký thành công",
      userId,
      role: "USER",
    };
  },
  async login({ email, password }) {
    const user = await UserRepository.findByEmailWithRole(email);
    if (!user) throw new Error("Email hoặc mật khẩu không đúng");
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Email hoặc mật khẩu không đúng");
    
    if (!user.isActive) throw new Error("Tài khoản đã bị khóa");

    const { password: _, ...safeUser } = user;
    return safeUser;
  },
  // 🟡 Cập nhật thông tin user
  async updateUser(userId, data) {
    const success = await UserRepository.update(userId, data);
    if (!success) throw new Error("Cập nhật thất bại hoặc không có gì thay đổi");
    return { message: "Cập nhật thành công" };
  },

  async changePassword(userId, { oldPassword, newPassword }) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new Error("Mật khẩu cũ không đúng");

    const hashed = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(userId, hashed);
    return { message: "Đổi mật khẩu thành công" };
  },

  // ✅ Hàm logic duy nhất để Toggle trạng thái
  async toggleUserStatus(userId, isActive) {
    const success = await UserRepository.updateStatus(userId, isActive);
    if (!success) throw new Error("Người dùng không tồn tại");
    return { message: isActive ? "Đã kích hoạt người dùng" : "Đã vô hiệu hóa người dùng" };
  },
};

module.exports = UserService;