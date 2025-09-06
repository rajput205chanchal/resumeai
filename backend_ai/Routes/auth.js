const router = require("express").Router();
const auth = require("../middleware/auth");
const { register, login, me } = require("../Controllers/authController");
const { upload } = require("../utils/multer");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);

module.exports = router;
