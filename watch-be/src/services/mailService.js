const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");

dotenv.config();

class MailService {
  constructor() {
    this.transporter = null;
  }

  async createTransporter() {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.MAIL_CLIENT_ID,
      process.env.MAIL_CLIENT_SECRET,
      process.env.MAIL_REDIRECT_URI ||
        "https://developers.google.com/oauthplayground"
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.MAIL_REFRESH_TOKEN,
    });

    const accessToken = await oAuth2Client.getAccessToken();

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.MAIL_USER,
        clientId: process.env.MAIL_CLIENT_ID,
        clientSecret: process.env.MAIL_CLIENT_SECRET,
        refreshToken: process.env.MAIL_REFRESH_TOKEN,
        accessToken: accessToken?.token || undefined,
      },
    });
  }

  async sendMail(to, subject, text, html) {
    if (!this.transporter) await this.createTransporter();

    const mailOptions = {
      from: `"3TMUSIC" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Email đã gửi tới ${to}`);
  }
}

module.exports = new MailService();
