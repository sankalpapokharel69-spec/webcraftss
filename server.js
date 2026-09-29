require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectDatabase } = require('./database/database');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------- Initialize Database ---------------- */
connectDatabase();

/* ---------------- Middleware ---------------- */
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ---------------- Uploads Folder ---------------- */
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

/* ---------------- Static Files ---------------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ---------------- Routes ---------------- */
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

/* ---------------- Main Page ---------------- */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ---------------- 404 ---------------- */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* ---------------- Error Handler ---------------- */
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('==============================================');
  console.log('  🚀 WebCraft Studio server is running!');
  console.log(`  🌐 http://localhost:${PORT}`);
  console.log('==============================================');
});