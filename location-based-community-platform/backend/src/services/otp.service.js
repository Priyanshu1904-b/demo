const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

let transporter;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getTransporter() {
  if (transporter) return transporter;
  const { host, port, secure, user, pass } = env.smtp;
  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are not configured");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
  return transporter;
}

async function attachOtp(user) {
  const otp = generateOtp();
  user.otpHash = await bcrypt.hash(otp, 10);
  user.otpExpiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);
  await user.save();
  return otp;
}

async function sendOtp(user, otp) {
  try {
    if (!user.email) throw new Error("Email OTP requires an email address");

    await getTransporter().sendMail({
      from: env.smtp.from,
      to: user.email,
      subject: "Your Location Community verification code",
      text: `Your verification code is ${otp}. It expires in ${env.otpExpiresMinutes} minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
          <h2>Verify your account</h2>
          <p>Your Location Community verification code is:</p>
          <p style="font-size:24px;font-weight:700;letter-spacing:4px">${otp}</p>
          <p>This code expires in ${env.otpExpiresMinutes} minutes.</p>
        </div>
      `
    });
  } catch (error) {
    if (!env.devOtpMode) {
      throw new ApiError(503, "Email OTP service is temporarily unavailable");
    }

    console.warn(`Email OTP fallback active (${error.message}). DEV OTP for ${user.email || user.phone}: ${otp}`);
  }
}

async function verifyOtp(user, otp) {
  if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new ApiError(400, "OTP expired. Please register again or request a new code.");
  }

  const valid = await bcrypt.compare(otp, user.otpHash);
  if (!valid) throw new ApiError(400, "Invalid OTP");

  user.verified = true;
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  await user.save();
}

module.exports = { attachOtp, sendOtp, verifyOtp };
