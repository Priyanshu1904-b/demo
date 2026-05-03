const router = require("express").Router();
const admin = require("../controllers/admin.controller");
const { protect, requireRoles } = require("../middleware/auth");

router.use(protect, requireRoles("admin", "super-admin"));
router.get("/users", admin.listUsers);
router.patch("/users/:id/verify", admin.setVerification);
router.delete("/users/:id", admin.deleteUser);
router.get("/posts", admin.listAllPosts);
router.delete("/posts/:id", admin.deletePost);

module.exports = router;
