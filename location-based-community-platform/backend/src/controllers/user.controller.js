const asyncHandler = require("../utils/asyncHandler");

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "location", "phone"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.json({ user: req.user.toSafeObject() });
});
