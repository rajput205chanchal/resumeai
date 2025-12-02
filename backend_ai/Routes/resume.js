const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const { authorize, ROLES } = require("../middleware/roles");
const {
  addResume,
  getAllResumesForUser,
  getResumesForAdmin,
  getResumeById,
  getResumeVersions,
  compareResumes,
  createShareLink,
  listShareLinks,
  revokeShareLink,
  getSharedResume,
  generateCoverLetter,
} = require("../Controllers/resumeController");

const { upload } = require("../utils/multer");

router.get("/shared/:token", getSharedResume);

router.get(
  "/",
  auth,
  authorize(ROLES.ADMIN, ROLES.RECRUITER),
  getResumesForAdmin
);

router.post("/", auth, upload.single("file"), addResume);

router.get("/mine", auth, getAllResumesForUser);
router.get("/shares", auth, listShareLinks);

router.get("/:id", auth, getResumeById);

router.get("/:id/versions", auth, getResumeVersions);

router.post("/compare", auth, compareResumes);
router.post("/:id/cover-letter", auth, generateCoverLetter);

router.post("/:id/share", auth, createShareLink);
router.delete("/share/:token", auth, revokeShareLink);

module.exports = router;
