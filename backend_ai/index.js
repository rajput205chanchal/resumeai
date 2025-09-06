const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
const FRONTEND_BUILD_DIR =
  process.env.FRONTEND_BUILD_DIR ||
  (fs.existsSync(path.join(__dirname, 'dist')) ? 'dist' : 'build');

require('./conn');

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

app.use('/uploads', express.static(uploadsPath, { fallthrough: true }));

const UserRoutes = require('./Routes/auth');
const ResumeRoutes = require('./Routes/resume');

app.use('/api/user', UserRoutes);
app.use('/api/resume', ResumeRoutes);

const staticRoot = path.join(__dirname, FRONTEND_BUILD_DIR);
if (fs.existsSync(staticRoot)) {
  app.use(express.static(staticRoot));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(staticRoot, 'index.html'));
  });
}

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  next();
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res
    .status(err.status || 500)
    .json({ error: 'Server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
  console.log(`CORS origin: ${CLIENT_ORIGIN}`);
  console.log(
    fs.existsSync(staticRoot)
      ? `Serving frontend from ./${FRONTEND_BUILD_DIR}`
      : `No frontend folder found to serve`
  );
  console.log('Static uploads: /uploads/*');
});
