const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { logAdminAction } = require("../services/adminLog.service");

exports.listAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: { $in: ["admin", "super-admin"] } }).select("-password -otpHash");
  res.json({ admins });
});

exports.createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email, and password are required");

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "Email already exists");

  const admin = await User.create({ name, email, password, role: "admin", verified: true });
  await logAdminAction({ action: "create_admin", performedBy: req.user._id, targetUser: admin._id });
  res.status(201).json({ admin: admin.toSafeObject() });
});

exports.setRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) throw new ApiError(400, "Role must be user or admin");

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "super-admin") throw new ApiError(403, "Cannot demote a super-admin");

  user.role = role;
  await user.save();
  await logAdminAction({
    action: "change_role",
    performedBy: req.user._id,
    targetUser: user._id,
    metadata: { role }
  });
  res.json({ user: user.toSafeObject() });
});

exports.deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.params.id);
  if (!admin) throw new ApiError(404, "Admin not found");
  if (admin.role !== "admin") throw new ApiError(400, "Only admin accounts can be deleted here");

  await admin.deleteOne();
  await logAdminAction({ action: "delete_admin", performedBy: req.user._id, targetUser: admin._id });
  res.json({ message: "Admin deleted" });
});
