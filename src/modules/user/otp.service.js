const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendMail } = require("../../utils/mailer");
const pool = require("../../config/database");

// Lưu OTP tạm thời trong bộ nhớ (có thể thay bằng Redis hoặc DB)
const otpStore = new Map();

// 🔹 Sinh mã OTP ngẫu nhiên 6 chữ số
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// 🔹 Gửi OTP đến email
async function sendOTP(email) {
  const otp = generateOTP();
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 phút

  const subject = "Mã xác thực OTP của bạn";
  const html = `
    <h2>Xin chào!</h2>
    <p>Mã OTP của bạn là:</p>
    <h3>${otp}</h3>
    <p>Mã này sẽ hết hạn sau <b>5 phút</b>.</p>
  `;

  await sendMail(email, subject, html);
  console.log(`📩 Đã gửi OTP ${otp} đến ${email}`);
}

// 🔹 Xác thực OTP
function verifyOTP(email, userOtp) {
  const record = otpStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expires) {
    otpStore.delete(email);
    return false;
  }
  return record.otp === userOtp;
}

// 🔹 Đặt lại mật khẩu sau khi OTP hợp lệ
async function resetPassword(email, otp, newPassword) {
  try {
    if (!email || !otp || !newPassword) {
      throw new Error("Thiếu email, OTP hoặc mật khẩu mới.");
    }

    // Kiểm tra OTP hợp lệ
    const valid = verifyOTP(email, otp);
    if (!valid) {
      throw new Error("OTP không hợp lệ hoặc đã hết hạn.");
    }

    // Hash mật khẩu mới
    const hashed = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu trong MySQL
    const [result] = await pool
      .promise()
      .query("UPDATE User SET password = ? WHERE email = ?", [hashed, email]);

    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy người dùng với email này.");
    }

    // Xóa OTP sau khi dùng
    otpStore.delete(email);

    return { success: true, message: "✅ Đặt lại mật khẩu thành công!" };
  } catch (err) {
    console.error("❌ Lỗi resetPassword:", err.message);
    return { success: false, message: err.message };
  }
}

module.exports = { sendOTP, verifyOTP, resetPassword };
