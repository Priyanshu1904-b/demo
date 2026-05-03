const router = require("express").Router();
const posts = require("../controllers/post.controller");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", posts.listPosts);
router.get("/mine", protect, posts.myPosts);
router.post("/", protect, upload.single("image"), posts.createPost);
router.patch("/:id", protect, upload.single("image"), posts.updatePost);
router.delete("/:id", protect, posts.deletePost);

module.exports = router;
