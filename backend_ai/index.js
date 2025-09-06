const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;
const FRONTEND_BUILD_DIR =
  process.env.FRONTEND_BUILD_DIR ||
  (fs.existsSync(path.join(__dirname, "dist")) ? "dist" : "build");

require("./conn");

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173", 
  "http://127.0.0.1:5173", 
  "https://resume-cv-ai.netlify.app", 
  "https://resumeai-f81w.onrender.com", 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); 
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error("CORS not allowed from this origin: " + origin),
        false
      );
    },
    credentials: true,
  })
);


const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

app.use("/uploads", express.static(uploadsPath, { fallthrough: true }));

const UserRoutes = require("./Routes/auth");
const ResumeRoutes = require("./Routes/resume");

app.use("/api/user", UserRoutes);
app.use("/api/resume", ResumeRoutes);

const staticRoot = path.join(__dirname, FRONTEND_BUILD_DIR);
if (fs.existsSync(staticRoot)) {
  app.use(express.static(staticRoot));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(staticRoot, "index.html"));
  });
}

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  next();
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ error: "Server error", message: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
  console.log(
    fs.existsSync(staticRoot)
      ? `Serving frontend from ./${FRONTEND_BUILD_DIR}`
      : `No frontend folder found to serve`
  );
  console.log("Static uploads: /uploads/*");
});
