const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"3TMUSIC" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email đã gửi đến: ${to}`);
  } catch (err) {
    console.error("❌ Lỗi gửi email:", err);
    throw err;
  }
}

module.exports = { sendMail };
