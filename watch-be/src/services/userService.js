const { ulid } = require("ulid");
const bcrypt = require("bcrypt");
const UserRepository = require("../infras/repositories/userRepository");
const RoleRepository = require("../infras/repositories/roleRepository"); // để lấy role nếu cần
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

const UserService = {
  // 🟢 Đăng ký
  async register({ name, email, phone, password }) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new Error("Email đã tồn tại");

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = ulid();

    await UserRepository.create({
      userId,
      name,
      email,
      phone,
      password: hashedPassword,
      roleId: null,
    });

    return { message: "Đăng ký thành công", userId };
  },

  // 🟢 Đăng nhập
  async login({ email, password }) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.isActive) throw new Error("Tài khoản không tồn tại hoặc đã bị vô hiệu hóa");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Mật khẩu không đúng");

    const token = jwt.sign(
      { userId: user.userId, roleId: user.roleId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return token;
  },

  // 🟢 Lấy danh sách tất cả người dùng (admin)
  async getAllUsers(currentUser) {
    if (!currentUser || currentUser.roleName !== "Admin") throw new Error("Không có quyền");
    return await UserRepository.findAll();
  },

  // 🟢 Lấy thông tin theo ID
  async getUserById(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");
    return user;
  },

  // 🟢 Đổi mật khẩu
  async changePassword(userId, { oldPassword, newPassword }) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new Error("Mật khẩu cũ không đúng");

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const success = await UserRepository.updatePassword(userId, hashedPassword);
    if (!success) throw new Error("Đổi mật khẩu thất bại");

    return { message: "Đổi mật khẩu thành công" };
  },

  // 🟢 Vô hiệu hóa người dùng (admin)
  async disableUser(userId, currentUser) {
    if (!currentUser || currentUser.roleName !== "Admin") throw new Error("Không có quyền");

    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    const success = await UserRepository.disableUser(userId);
    if (!success) throw new Error("Vô hiệu hóa thất bại");

    return { message: "Người dùng đã bị vô hiệu hóa" };
  }
};

module.exports = UserService;
