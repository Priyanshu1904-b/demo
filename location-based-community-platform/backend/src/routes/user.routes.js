const router = require("express").Router();
const user = require("../controllers/user.controller");
const { protect } = require("../middleware/auth");

router.get("/me", protect, user.getMe);
router.patch("/me", protect, user.updateMe);

module.exports = router;
