const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const { authorize, ROLES } = require("../middleware/roles");
const {
  addResume,
  getAllResumesForUser,
  getResumesForAdmin,
  getResumeById,
} = require("../Controllers/resumeController");

const { upload } = require("../utils/multer");

router.post("/", auth, upload.single("file"), addResume);

router.get("/mine", auth, getAllResumesForUser);

router.get(
  "/",
  auth,
  authorize(ROLES.ADMIN, ROLES.RECRUITER),
  getResumesForAdmin
);

router.get("/:id", auth, getResumeById);

module.exports = router;
