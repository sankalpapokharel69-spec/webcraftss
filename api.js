const express = require('express');
const path = require('path');
const multer = require('multer');
const db = require('../database/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/* ---------------- Multer Image Upload Config ---------------- */
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'project-' + unique + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp|svg/.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (ok) cb(null, true);
    else cb(new Error('Only image files are allowed (jpg, png, gif, webp, svg).'));
  }
});

/* ================= PROJECTS ================= */

/* GET /api/projects - PUBLIC */
router.get('/projects', (req, res) => {
  res.json({ success: true, data: db.getAllProjects() });
});

/* POST /api/projects - ADMIN ONLY (with image upload) */
router.post('/projects', authenticate('admin'), upload.single('image'), (req, res) => {
  const {
    title, description = '', category = 'Web Design',
    link = '', technologies = '', imageUrl = ''
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Project title is required.' });
  }

  const image = req.file ? '/uploads/' + req.file.filename : (imageUrl.trim() || null);

  const project = db.addProject({
    title: title.trim(), description, category, image, link, technologies
  });

  res.status(201).json({ success: true, message: 'Project added successfully!', data: project });
});

/* PUT /api/projects/:id - ADMIN ONLY */
router.put('/projects/:id', authenticate('admin'), upload.single('image'), (req, res) => {
  const existing = db.getProject(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const {
    title = existing.title,
    description = existing.description,
    category = existing.category,
    link = existing.link,
    technologies = existing.technologies,
    imageUrl = ''
  } = req.body;

  let image = existing.image;
  if (req.file) image = '/uploads/' + req.file.filename;
  else if (imageUrl && imageUrl.trim()) image = imageUrl.trim();

  const project = db.updateProject(req.params.id, {
    title: title.trim(), description, category, image, link, technologies
  });

  res.json({ success: true, message: 'Project updated successfully!', data: project });
});

/* DELETE /api/projects/:id - ADMIN ONLY */
router.delete('/projects/:id', authenticate('admin'), (req, res) => {
  const ok = db.deleteProject(req.params.id);
  if (!ok) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }
  res.json({ success: true, message: 'Project deleted successfully!' });
});

/* ================= CONTACT / MESSAGES ================= */

/* POST /api/contact - PUBLIC (customer form) */
router.post('/contact', (req, res) => {
  const { name, email, phone = '', subject = '', message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Please enter your name.' });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email.' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Please write your message.' });
  }

  db.addMessage({
    name: name.trim(), email: email.trim(), phone, subject, message: message.trim()
  });

  res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been sent to our inbox.'
  });
});

/* GET /api/messages - INBOX ONLY */
router.get('/messages', authenticate('inbox'), (req, res) => {
  res.json({ success: true, data: db.getAllMessages() });
});

/* PATCH /api/messages/:id/read - INBOX ONLY */
router.patch('/messages/:id/read', authenticate('inbox'), (req, res) => {
  const msg = db.toggleMessageRead(req.params.id);
  if (!msg) {
    return res.status(404).json({ success: false, message: 'Message not found.' });
  }
  res.json({
    success: true,
    message: msg.is_read ? 'Marked as read' : 'Marked as unread',
    is_read: msg.is_read
  });
});

/* DELETE /api/messages/:id - INBOX ONLY */
router.delete('/messages/:id', authenticate('inbox'), (req, res) => {
  const ok = db.deleteMessage(req.params.id);
  if (!ok) {
    return res.status(404).json({ success: false, message: 'Message not found.' });
  }
  res.json({ success: true, message: 'Message deleted successfully!' });
});

module.exports = router;
