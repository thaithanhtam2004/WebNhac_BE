const {
  sendOTP,
  verifyOTP,
  resetPassword,
} = require("../../services/otpService");

exports.sendOtpController = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập email" });
  }

  try {
    await sendOTP(email);
    res.json({ success: true, message: "Đã gửi OTP đến email của bạn" });
  } catch (err) {
    console.error("❌ Lỗi gửi OTP:", err);
    res.status(500).json({ success: false, message: "Lỗi gửi OTP" });
  }
};

exports.verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin" });
  }

  const isValid = verifyOTP(email, otp);
  if (!isValid) {
    return res
      .status(400)
      .json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn" });
  }

  res.json({ success: true, message: "Xác thực OTP thành công" });
};
exports.resetPasswordController = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Thiếu email, OTP hoặc mật khẩu mới",
    });
  }

  try {
    const result = await resetPassword(email, otp, newPassword);
    if (result.success) {
      return res.json({ success: true, message: result.message });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("❌ Lỗi khi đặt lại mật khẩu:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đặt lại mật khẩu, vui lòng thử lại sau",
    });
  }
};
