const Post = require("../models/Post");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { notify } = require("../services/socket.service");

function parseLocation(body) {
  const lat = Number(body.lat ?? body.location?.lat);
  const lng = Number(body.lng ?? body.location?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new ApiError(400, "Valid latitude and longitude are required");
  }
  return {
    lat,
    lng,
    address: body.address ?? body.location?.address ?? ""
  };
}

exports.listPosts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
  const search = req.query.search?.trim();
  const query = search ? { $text: { $search: search } } : {};

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments(query)
  ]);

  res.json({ posts, page, totalPages: Math.ceil(total / limit), total });
});

exports.myPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ posts });
});

exports.createPost = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) throw new ApiError(400, "Title and description are required");

  const post = await Post.create({
    title,
    description,
    image: req.file ? `/uploads/${req.file.filename}` : req.body.image || "",
    location: parseLocation(req.body),
    userId: req.user._id
  });

  notify("post:created", post);
  res.status(201).json({ post });
});

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");
  if (post.userId.toString() !== req.user._id.toString() && req.user.role === "user") {
    throw new ApiError(403, "You can only update your own posts");
  }

  ["title", "description"].forEach((field) => {
    if (req.body[field] !== undefined) post[field] = req.body[field];
  });
  if (req.body.lat !== undefined || req.body.lng !== undefined || req.body.location) {
    post.location = parseLocation(req.body);
  }
  if (req.file) post.image = `/uploads/${req.file.filename}`;

  await post.save();
  res.json({ post });
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");
  if (post.userId.toString() !== req.user._id.toString() && req.user.role === "user") {
    throw new ApiError(403, "You can only delete your own posts");
  }
  await post.deleteOne();
  res.json({ message: "Post deleted" });
});
