const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const validator = require("validator");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { signAccessToken, signRefreshToken, hashToken } = require("../utils/token");
const { attachOtp, sendOtp, verifyOtp } = require("../services/otp.service");

function refreshExpiryDate() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

function contactClauses({ email, phone }) {
  const clauses = [];
  if (email) clauses.push({ email: email.toLowerCase() });
  if (phone) clauses.push({ phone });
  return clauses;
}

async function issueTokens(user) {
  const tokenId = crypto.randomUUID();
  const refreshToken = signRefreshToken(user, tokenId);
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiryDate()
  });
  return { accessToken: signAccessToken(user), refreshToken };
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, location } = req.body;

  if (!name || !password || (!email && !phone)) {
    throw new ApiError(400, "Name, password, and email or phone are required");
  }
  if (email && !validator.isEmail(email)) throw new ApiError(400, "Invalid email");
  if (password.length < 8) throw new ApiError(400, "Password must be at least 8 characters");

  const existing = await User.findOne({ $or: contactClauses({ email, phone }) });
  if (existing) throw new ApiError(409, "User already exists");

  const user = await User.create({ name, email, phone, password, location });
  const otp = await attachOtp(user);
  await sendOtp(user, otp);

  res.status(201).json({
    message: env.devOtpMode ? "Registered. Check server logs for dev OTP." : "Registered. OTP sent.",
    user: user.toSafeObject()
  });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, phone, otp } = req.body;
  if ((!email && !phone) || !otp) throw new ApiError(400, "Email or phone and OTP are required");

  const user = await User.findOne({ $or: contactClauses({ email, phone }) });
  if (!user) throw new ApiError(404, "User not found");

  await verifyOtp(user, otp);
  const tokens = await issueTokens(user);
  res.json({ message: "Account verified", user: user.toSafeObject(), ...tokens });
});

exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) throw new ApiError(400, "Identifier and password are required");

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }]
  });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }
  if (!user.verified) throw new ApiError(403, "Please verify your account first");

  const tokens = await issueTokens(user);
  res.json({ user: user.toSafeObject(), ...tokens });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "Refresh token required");

  const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
  const stored = await RefreshToken.findOne({
    userId: decoded.sub,
    tokenHash: hashToken(refreshToken),
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  });
  if (!stored) throw new ApiError(401, "Invalid refresh token");

  stored.revokedAt = new Date();
  await stored.save();

  const user = await User.findById(decoded.sub);
  if (!user) throw new ApiError(401, "User no longer exists");

  const tokens = await issueTokens(user);
  res.json(tokens);
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.updateOne(
      { tokenHash: hashToken(refreshToken) },
      { revokedAt: new Date() }
    );
  }
  res.json({ message: "Logged out" });
});
