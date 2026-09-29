const fs = require('fs');
const path = require('path');

/* Ensure data folder exists */
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.json');

/* ---------- In-memory store ---------- */
let store = {
  nextProjectId: 1,
  nextMessageId: 1,
  projects: [],
  messages: []
};

/* ---------- Persistence ---------- */
function save() {
  fs.writeFileSync(dbPath, JSON.stringify(store, null, 2), 'utf8');
}

function connectDatabase() {
  if (fs.existsSync(dbPath)) {
    try {
      store = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      console.log('OK: Database loaded from data/database.json');
      return;
    } catch {
      console.warn('WARN: database.json corrupted - creating a fresh one.');
    }
  }

  /* Seed Default Projects (first run only) */
  const now = new Date().toISOString();
  const defaults = [
    ['Luxe Fashion Store', 'A premium e-commerce experience with 3D product previews, seamless checkout and animated lookbooks.', 'E-Commerce', 'React, Node.js, Stripe, MongoDB'],
    ['Nova SaaS Dashboard', 'Analytics platform with real-time charts, dark-mode glass UI and smooth micro-interactions.', 'Development', 'Vue.js, D3.js, Express, PostgreSQL'],
    ['Aurora Brand Identity', 'Complete brand system - logo, motion graphics and a glowing award-winning landing page.', 'Branding', 'Figma, After Effects, WebGL'],
    ['Orbit Portfolio 3D', 'An immersive 3D scroll portfolio with particle galaxy background and cinematic reveals.', 'Web Design', 'Three.js, GSAP, CSS3'],
    ['Foodies Delivery App', 'Mobile-first ordering app with live tracking, playful animations and one-tap re-order.', 'UI/UX', 'Flutter, Figma, Firebase'],
    ['TechBlog Platform', 'SEO-optimized publishing platform with rich-text editor and 100/100 Lighthouse score.', 'Development', 'Next.js, GraphQL, Tailwind']
  ];

  defaults.forEach(([title, description, category, technologies]) => {
    store.projects.push({
      id: store.nextProjectId++,
      title, description, category, technologies,
      image: null,
      link: '#',
      created_at: now
    });
  });

  save();
  console.log('OK: Database seeded with 6 sample projects');
}

/* ================= PROJECTS ================= */
function getAllProjects() {
  return [...store.projects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getProject(id) {
  return store.projects.find((p) => p.id === Number(id)) || null;
}

function addProject({ title, description, category, image, link, technologies }) {
  const project = {
    id: store.nextProjectId++,
    title, description, category, image, link, technologies,
    created_at: new Date().toISOString()
  };
  store.projects.push(project);
  save();
  return project;
}

function updateProject(id, fields) {
  const project = getProject(id);
  if (!project) return null;
  Object.assign(project, fields);
  save();
  return project;
}

function deleteProject(id) {
  const index = store.projects.findIndex((p) => p.id === Number(id));
  if (index === -1) return false;
  store.projects.splice(index, 1);
  save();
  return true;
}

/* ================= MESSAGES ================= */
function addMessage({ name, email, phone, subject, message }) {
  const msg = {
    id: store.nextMessageId++,
    name, email, phone, subject, message,
    is_read: 0,
    created_at: new Date().toISOString()
  };
  store.messages.push(msg);
  save();
  return msg;
}

function getAllMessages() {
  return [...store.messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function toggleMessageRead(id) {
  const msg = store.messages.find((m) => m.id === Number(id));
  if (!msg) return null;
  msg.is_read = msg.is_read ? 0 : 1;
  save();
  return msg;
}

function deleteMessage(id) {
  const index = store.messages.findIndex((m) => m.id === Number(id));
  if (index === -1) return false;
  store.messages.splice(index, 1);
  save();
  return true;
}

module.exports = {
  connectDatabase,
  getAllProjects, getProject, addProject, updateProject, deleteProject,
  addMessage, getAllMessages, toggleMessageRead, deleteMessage
};
