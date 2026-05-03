const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "Authentication required");

  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.sub);
  if (!user) throw new ApiError(401, "User no longer exists");
  if (!user.verified) throw new ApiError(403, "Account verification is required");

  req.user = user;
  next();
});

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }
  next();
};

module.exports = { protect, requireRoles };
