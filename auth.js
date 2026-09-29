const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/* ================= POST /api/auth/login ================= */
router.post('/login', (req, res) => {
  const { password, role } = req.body;

  if (!password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Password and role are required.'
    });
  }

  let isValid = false;

  if (role === 'admin') {
    /* Admin password verified on the SERVER */
    isValid = password === process.env.ADMIN_PASSWORD;
  } else if (role === 'inbox') {
    /* Inbox password verified on the SERVER */
    isValid = password === process.env.INBOX_PASSWORD;
  } else {
    return res.status(400).json({ success: false, message: 'Invalid role.' });
  }

  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: '❌ Incorrect password. Please try again.'
    });
  }

  /* Issue JWT token valid for 24 hours */
  const token = jwt.sign(
    { role, loginTime: Date.now() },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: '✅ Login successful',
    token,
    role
  });
});

/* ================= GET /api/auth/verify ================= */
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ success: false, valid: false });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return res.json({ success: true, valid: true, role: decoded.role });
  } catch {
    return res.json({ success: false, valid: false });
  }
});

module.exports = router;