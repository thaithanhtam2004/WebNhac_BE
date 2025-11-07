const express = require("express");
const router = express.Router();
const otpController = require("../controller/otpController");

// Gửi mã OTP qua email
router.post("/send-otp", otpController.sendOtpController);

// Xác thực mã OTP
router.post("/verify-otp", otpController.verifyOtpController);

// ✅ Đặt lại mật khẩu sau khi OTP hợp lệ
router.post("/reset-password", otpController.resetPasswordController);

module.exports = router;
