const bcrypt = require("bcryptjs");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
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
    if (!env.otpServiceKey) {
      throw new Error("OTP provider is not configured");
    }

    // Provider integration belongs here. Keep this service as the only touchpoint.
    console.log(`OTP service placeholder sent code to ${user.email || user.phone}`);
  } catch (error) {
    if (!env.devOtpMode) {
      throw new ApiError(503, "OTP service is temporarily unavailable");
    }

    console.warn(`DEV OTP for ${user.email || user.phone}: ${otp}`);
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
