require("dotenv").config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/location-community",
  jwtSecret: process.env.JWT_SECRET || "dev-access-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  devOtpMode: process.env.DEV_OTP_MODE !== "false",
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 10),
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com"
  },
  superAdmin: {
    name: process.env.SUPER_ADMIN_NAME || "Root Admin",
    email: process.env.SUPER_ADMIN_EMAIL || "root@example.com",
    password: process.env.SUPER_ADMIN_PASSWORD || "ChangeMe123!"
  }
};

module.exports = env;
