const User = require("../models/User");
const Post = require("../models/Post");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { logAdminAction } = require("../services/adminLog.service");

exports.listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -otpHash").sort({ createdAt: -1 });
  res.json({ users });
});

exports.setVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "super-admin") throw new ApiError(403, "Cannot change super-admin verification");

  user.verified = Boolean(req.body.verified);
  await user.save();
  await logAdminAction({
    action: user.verified ? "verify_user" : "unverify_user",
    performedBy: req.user._id,
    targetUser: user._id
  });
  res.json({ user: user.toSafeObject() });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "super-admin") throw new ApiError(403, "Cannot delete a super-admin");

  await Post.deleteMany({ userId: user._id });
  await user.deleteOne();
  await logAdminAction({ action: "delete_user", performedBy: req.user._id, targetUser: user._id });
  res.json({ message: "User and associated posts deleted" });
});

exports.listAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate("userId", "name email role").sort({ createdAt: -1 });
  res.json({ posts });
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");
  await post.deleteOne();
  await logAdminAction({ action: "delete_post", performedBy: req.user._id, targetPost: post._id });
  res.json({ message: "Post deleted" });
});
