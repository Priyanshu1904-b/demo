const router = require("express").Router();
const auth = require("../controllers/auth.controller");

router.post("/register", auth.register);
router.post("/verify-otp", auth.verifyOtp);
router.post("/login", auth.login);
router.post("/refresh-token", auth.refreshToken);
router.post("/logout", auth.logout);

module.exports = router;
