const multer = require("multer");

const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
]);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (allowedTypes.has(file.mimetype)) return cb(null, true);
  cb(
    Object.assign(new Error("Only PDF, JPG, and PNG files are allowed"), {
      status: 415,
    }),
    false
  );
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, 
});
