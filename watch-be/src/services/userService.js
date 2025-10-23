const { ulid } = require("ulid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserRepository = require("../infras/repositories/userRepository.js");
const MailService = require("./mailService.js");

const SALT_ROUNDS = 10;
const otpStore = {};

const UserService = {
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

  async login({ email, password }) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.isActive)
      throw new Error("Tài khoản không tồn tại hoặc đã bị vô hiệu hóa");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Mật khẩu không đúng");

    const token = jwt.sign(
      { userId: user.userId, roleId: user.roleId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return token;
  },

  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("Email không tồn tại trong hệ thống");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    await MailService.sendMail(
      email,
      "Mã OTP đặt lại mật khẩu",
      `Xin chào ${user.name},\n\nMã OTP của bạn là: ${otp}\nMã này có hiệu lực trong 5 phút.`,
      `<p>Xin chào <b>${user.name}</b>,</p><p>Mã OTP của bạn là: <b>${otp}</b></p><p>Mã có hiệu lực trong 5 phút.</p>`
    );

    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);

    return "Mã OTP đã được gửi qua email.";
  },

  async resetPassword(email, otp, newPassword) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("Email không tồn tại");

    if (!otpStore[email]) throw new Error("OTP đã hết hạn hoặc không tồn tại");
    if (otpStore[email] !== otp) throw new Error("Mã OTP không chính xác");

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const success = await UserRepository.updatePassword(user.userId, hashed);
    if (!success) throw new Error("Đặt lại mật khẩu thất bại");

    delete otpStore[email];
    return "Đặt lại mật khẩu thành công!";
  },
  async getUserById(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");
    return user;
  },
};

module.exports = UserService;
