const router = require("express").Router();
const superAdmin = require("../controllers/superAdmin.controller");
const { protect, requireRoles } = require("../middleware/auth");

router.use(protect, requireRoles("super-admin"));
router.get("/admins", superAdmin.listAdmins);
router.post("/admins", superAdmin.createAdmin);
router.patch("/users/:id/role", superAdmin.setRole);
router.delete("/admins/:id", superAdmin.deleteAdmin);

module.exports = router;
