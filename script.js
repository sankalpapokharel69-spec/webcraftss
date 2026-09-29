/* ═══════════════════════════════════════════════════════
   WEBCRAFT STUDIO — FRONTEND ENGINE
   ═══════════════════════════════════════════════════════ */

/* ---------- Global State ---------- */
let adminToken = sessionStorage.getItem('wc_admin_token') || null;
let inboxToken = sessionStorage.getItem('wc_inbox_token') || null;
let projects = [];
let activeFilter = 'all';
let editingId = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ═══════════ PRELOADER ═══════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    $('#preloader').classList.add('hidden');
    document.body.style.overflow = '';
  }, 1400);
});
document.body.style.overflow = 'hidden';

/* ═══════════ TOAST HELPER ═══════════ */
function toast(message, type = 'success') {
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info'
  };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span>${message}</span>`;
  $('#toast-container').appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 400);
  }, 3600);
}

/* ═══════════ CUSTOM CURSOR ═══════════ */
(function initCursor() {
  const cursor = $('#cursor');
  const glow = $('#cursor-glow');
  if (!cursor || !glow) return;

  let mx = 0, my = 0, gx = 0, gy = 0;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  (function follow() {
    gx += (mx - gx) * 0.16;
    gy += (my - gy) * 0.16;
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    requestAnimationFrame(follow);
  })();

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, textarea, select, .project-card, .service-card')) {
      glow.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, input, textarea, select, .project-card, .service-card')) {
      glow.classList.remove('hovering');
    }
  });
})();

/* ═══════════ NAVBAR: SCROLL + ACTIVE LINK ═══════════ */
(function initNavbar() {
  const navbar = $('#navbar');
  const links = $$('.nav-link');
  const sections = $$('section[id], header[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    let current = '';
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
    });
    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
})();

/* ═══════════ MOBILE MENU ═══════════ */
(function initMobileMenu() {
  const burger = $('#hamburger');
  const navLinks = $('#navLinks');

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
})();

/* ═══════════ HERO TYPING EFFECT ═══════════ */
(function initTyping() {
  const el = $('#typing-text');
  if (!el) return;

  const words = ['Experiences', 'Masterpieces', 'Websites', 'Brands'];
  let wordIndex = 0, charIndex = 0, deleting = false;

  function type() {
    const word = words[wordIndex];

    if (!deleting) {
      el.textContent = word.slice(0, ++charIndex);
      if (charIndex === word.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
      setTimeout(type, 85);
    } else {
      el.textContent = word.slice(0, --charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 350);
        return;
      }
      setTimeout(type, 42);
    }
  }
  type();
})();

/* ═══════════ COUNTERS ═══════════ */
(function initCounters() {
  const counters = $$('[data-counter]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.counter;
      const duration = 1800;
      const start = performance.now();

      (function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      })(start);

      io.unobserve(el);
    });
  }, { threshold: 0.4 });

  counters.forEach((c) => io.observe(c));
})();

/* ═══════════ REVEAL ON SCROLL ═══════════ */
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 90 + 'ms';
    io.observe(el);
  });
})();

/* ═══════════ 3D TILT EFFECT ═══════════ */
(function initTilt() {
  $$('.tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
    });
  });
})();

/* ═══════════ MAGNETIC BUTTONS ═══════════ */
(function initMagnetic() {
  $$('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ═══════════ ANIMATED PARTICLE BACKGROUND ═══════════ */
(function initParticles() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let W, H;
  const mouse = { x: null, y: null };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(Math.floor(W * H / 16000), 110);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.6,
      hue: Math.random() > 0.5 ? 258 : 195
    }));
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
  });

  (function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      /* Glow dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 72%, 0.55)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 65%, 0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0;

      /* Connect nearby particles */
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `hsla(230, 80%, 70%, ${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      /* Connect to mouse */
      if (mouse.x !== null) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 170) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `hsla(195, 100%, 65%, ${0.18 * (1 - dist / 170)})`;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  })();
})();

/* ═══════════ HERO VIDEO (auto-detects hero-video.mp4) ═══════════ */
(function initHeroVideo() {
  const video = $('#heroVideo');
  if (!video) return;
  video.addEventListener('canplay', () => video.classList.add('loaded'));
  video.addEventListener('error', () => video.style.display = 'none');
})();

/* ═══════════ API HELPER ═══════════ */
async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  const token = adminToken || inboxToken;
  if (token && path !== '/api/auth/login') {
    headers['Authorization'] = 'Bearer ' + token;
  }
  const res = await fetch(path, { ...options, headers });
  return res.json();
}

/* ═══════════ MODAL HELPERS ═══════════ */
function openModal(id) {
  $('#' + id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  $('#' + id).classList.remove('open');
  document.body.style.overflow = '';
}

$$('.modal-backdrop').forEach((bd) => {
  bd.addEventListener('click', (e) => {
    if (e.target === bd) closeModal(bd.id);
  });
});
$$('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $$('.modal-backdrop.open').forEach((m) => closeModal(m.id));
});

/* ═══════════ PASSWORD VISIBILITY TOGGLES ═══════════ */
$$('.pass-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = $('#' + btn.dataset.target);
    const icon = btn.querySelector('i');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    icon.className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  });
});

/* ═══════════ PORTFOLIO: LOAD + RENDER ═══════════ */
const PLACEHOLDERS = ['ph-1', 'ph-2', 'ph-3', 'ph-4', 'ph-5', 'ph-6'];

function initials(title) {
  return title.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

async function loadProjects() {
  try {
    const res = await api('/api/projects');
    if (!res.success) throw new Error(res.message);
    projects = res.data;
    renderFilters();
    renderPortfolio();
    renderAdminList();
  } catch (err) {
    $('#portfolioGrid').innerHTML =
      `<div class="portfolio-loading"><i class="fa-solid fa-triangle-exclamation"></i><p>Could not load projects. Is the server running?</p></div>`;
  }
}

function renderFilters() {
  const cats = ['all', ...new Set(projects.map((p) => p.category))];
  const bar = $('#filterBar');
  bar.innerHTML = '';
  cats.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === activeFilter ? ' active' : '');
    btn.textContent = cat === 'all' ? 'All Projects' : cat;
    btn.addEventListener('click', () => {
      activeFilter = cat;
      renderFilters();
      renderPortfolio();
    });
    bar.appendChild(btn);
  });
}

function renderPortfolio() {
  const grid = $('#portfolioGrid');
  const list = activeFilter === 'all' ? projects : projects.filter((p) => p.category === activeFilter);

  if (!list.length) {
    grid.innerHTML = `<div class="portfolio-loading"><i class="fa-solid fa-box-open" style="font-size:2rem;margin-bottom:12px;"></i><p>No projects yet — add some from the Admin Panel!</p></div>`;
    return;
  }

  grid.innerHTML = list.map((p, i) => {
    const ph = PLACEHOLDERS[i % PLACEHOLDERS.length];
    const image = p.image
      ? `<img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.outerHTML='<div class=\\'project-placeholder ${ph}\\'>${initials(p.title)}</div>'" />`
      : `<div class="project-placeholder ${ph}">${initials(p.title)}</div>`;

    const tech = (p.technologies || '')
      .split(',').map((t) => t.trim()).filter(Boolean)
      .map((t) => `<span>${t}</span>`).join('');

    return `
      <article class="project-card" style="animation-delay:${i * 80}ms">
        <div class="project-media">
          ${image}
          <span class="project-cat">${p.category}</span>
        </div>
        <div class="project-body">
          <h3>${p.title}</h3>
          <p>${p.description || 'A premium crafted project by WebCraft Studio.'}</p>
          <div class="tech-chips">${tech}</div>
          ${p.link ? `<a class="project-link" href="${p.link}" target="_blank" rel="noopener">View Project <i class="fa-solid fa-arrow-right"></i></a>` : ''}
        </div>
      </article>`;
  }).join('');
}

/* ═══════════ CONTACT FORM → SERVER ═══════════ */
(function initContactForm() {
  const form = $('#contactForm');
  const submitBtn = $('#contactSubmit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const original = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
      const res = await api('/api/contact', {
        method: 'POST',
        body: {
          name: $('#cName').value,
          email: $('#cEmail').value,
          phone: $('#cPhone').value,
          subject: $('#cSubject').value,
          message: $('#cMessage').value
        }
      });

      if (res.success) {
        toast(res.message, 'success');
        form.reset();
      } else {
        toast(res.message, 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = original;
      submitBtn.disabled = false;
    }
  });
})();

/* ═══════════ AUTH: LOGIN (server-side password check) ═══════════ */
async function login(password, role) {
  const res = await api('/api/auth/login', { method: 'POST', body: { password, role } });
  if (res.success) {
    if (role === 'admin') {
      adminToken = res.token;
      sessionStorage.setItem('wc_admin_token', res.token);
    } else {
      inboxToken = res.token;
      sessionStorage.setItem('wc_inbox_token', res.token);
    }
  }
  return res;
}

/* ═══════════ ADMIN PANEL ═══════════ */
(function initAdmin() {
  const modal = $('#adminModal');

  function openAdmin() {
    openModal('adminModal');
    if (adminToken) {
      verifySession('admin');
    } else {
      switchView('adminLoginView');
    }
  }

  async function verifySession(role) {
    const token = role === 'admin' ? adminToken : inboxToken;
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: 'Bearer ' + token }
      }).then((r) => r.json());
      if (res.valid) {
        if (role === 'admin') {
          switchView('adminDashView');
          renderAdminList();
        } else {
          switchView('inboxDashView');
          loadMessages();
        }
      } else {
        logout(role);
      }
    } catch {
      logout(role);
    }
  }

  function switchView(viewId) {
    $$('#adminModal .modal-view, #inboxModal .modal-view').forEach((v) => v.classList.remove('active'));
    $('#' + viewId).classList.add('active');
  }

  function logout(role) {
    if (role === 'admin') {
      adminToken = null;
      sessionStorage.removeItem('wc_admin_token');
      switchView('adminLoginView');
      $('#adminPassword').value = '';
    } else {
      inboxToken = null;
      sessionStorage.removeItem('wc_inbox_token');
      switchView('inboxLoginView');
      $('#inboxPassword').value = '';
    }
  }

  /* --- Open triggers --- */
  $('#adminNavBtn').addEventListener('click', openAdmin);
  $('#adminLink').addEventListener('click', (e) => { e.preventDefault(); openAdmin(); });

  /* --- Admin Login --- */
  $('#adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#adminLoginBtn');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
    btn.disabled = true;

    const res = await login($('#adminPassword').value, 'admin');
    btn.innerHTML = original;
    btn.disabled = false;

    if (res.success) {
      toast('Welcome back, Admin! 🎉', 'success');
      $('#adminPassword').value = '';
      switchView('adminDashView');
      renderAdminList();
    } else {
      toast(res.message || 'Incorrect password.', 'error');
    }
  });

  /* --- Image preview --- */
  $('#pImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = $('#imagePreview');
    if (file) {
      $('#fileLabel').textContent = file.name;
      const reader = new FileReader();
      reader.onload = (ev) => {
        preview.src = ev.target.result;
        preview.classList.add('show');
      };
      reader.readAsDataURL(file);
    } else {
      preview.classList.remove('show');
      $('#fileLabel').textContent = 'Upload project image (jpg/png/webp)';
    }
  });

  /* --- Add / Update Project --- */
  $('#projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#projectSubmitBtn');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    const fd = new FormData();
    if (editingId) fd.append('id', editingId);
    fd.append('title', $('#pTitle').value);
    fd.append('description', $('#pDesc').value);
    fd.append('category', $('#pCategory').value);
    fd.append('technologies', $('#pTech').value);
    fd.append('link', $('#pLink').value);
    fd.append('imageUrl', $('#pImageUrl').value);
    const file = $('#pImage').files[0];
    if (file) fd.append('image', file);

    try {
      const res = await fetch(editingId ? `/api/projects/${editingId}` : '/api/projects', {
        method: editingId ? 'PUT' : 'POST',
        headers: { Authorization: 'Bearer ' + adminToken },
        body: fd
      }).then((r) => r.json());

      if (res.success) {
        toast(res.message, 'success');
        resetProjectForm();
        await loadProjects();
      } else {
        toast(res.message, 'error');
      }
    } catch {
      toast('Network error while saving.', 'error');
    } finally {
      btn.innerHTML = original;
      btn.disabled = false;
    }
  });

  /* --- Reset form --- */
  function resetProjectForm() {
    editingId = null;
    $('#projectForm').reset();
    $('#projectId').value = '';
    $('#imagePreview').classList.remove('show');
    $('#fileLabel').textContent = 'Upload project image (jpg/png/webp)';
    $('#projectSubmitBtn').innerHTML = '<i class="fa-solid fa-plus"></i> Add Project';
  }
  $('#resetFormBtn').addEventListener('click', resetProjectForm);

  /* --- Admin project list --- */
  window.renderAdminList = function () {
    const list = $('#adminProjectsList');
    $('#projectCount').textContent = projects.length;

    if (!projects.length) {
      list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No projects yet. Add your first one above!</p></div>`;
      return;
    }

    list.innerHTML = projects.map((p, i) => {
      const thumb = p.image
        ? `<img src="${p.image}" alt="" onerror="this.style.display='none'" />`
        : initials(p.title);
      return `
        <div class="admin-item" style="animation-delay:${i * 60}ms">
          <div class="admin-thumb">${thumb}</div>
          <div class="admin-info">
            <b>${p.title}</b>
            <span>${p.category} • ${p.technologies || 'No tech listed'}</span>
          </div>
          <div class="admin-actions">
            <button class="mini-btn edit" data-edit="${p.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="mini-btn del" data-del="${p.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>`;
    }).join('');

    /* Edit buttons */
    list.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = projects.find((x) => x.id == btn.dataset.edit);
        if (!p) return;
        editingId = p.id;
        $('#pTitle').value = p.title;
        $('#pDesc').value = p.description || '';
        $('#pCategory').value = p.category;
        $('#pTech').value = p.technologies || '';
        $('#pLink').value = p.link || '';
        $('#pImageUrl').value = '';
        $('#projectSubmitBtn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Project';
        if (p.image) {
          $('#imagePreview').src = p.image;
          $('#imagePreview').classList.add('show');
        }
        $('.modal').scrollIntoView({ behavior: 'smooth', block: 'start' });
        toast('Editing "' + p.title + '"', 'info');
      });
    });

    /* Delete buttons */
    list.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this project permanently?')) return;
        try {
          const res = await fetch(`/api/projects/${btn.dataset.del}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + adminToken }
          }).then((r) => r.json());

          if (res.success) {
            toast(res.message, 'success');
            if (editingId == btn.dataset.del) resetProjectForm();
            await loadProjects();
          } else {
            toast(res.message, 'error');
          }
        } catch {
          toast('Network error while deleting.', 'error');
        }
      });
    });
  };

  /* --- Admin logout --- */
  $('#adminLogoutBtn').addEventListener('click', () => {
    logout('admin');
    toast('Logged out of admin panel.', 'info');
  });

  /* ═══════════ INBOX ═══════════ */
  function openInbox() {
    openModal('inboxModal');
    if (inboxToken) verifySession('inbox');
    else switchView('inboxLoginView');
  }

  $('#inboxNavBtn').addEventListener('click', openInbox);
  $('#inboxLink').addEventListener('click', (e) => { e.preventDefault(); openInbox(); });

  $('#inboxLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#inboxLoginBtn');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
    btn.disabled = true;

    const res = await login($('#inboxPassword').value, 'inbox');
    btn.innerHTML = original;
    btn.disabled = false;

    if (res.success) {
      toast('Inbox unlocked! 📬', 'success');
      $('#inboxPassword').value = '';
      switchView('inboxDashView');
      loadMessages();
    } else {
      toast(res.message || 'Incorrect password.', 'error');
    }
  });

  async function loadMessages() {
    const box = $('#inboxMessages');
    box.innerHTML = `<div class="empty-state"><div class="spinner"></div><p>Loading messages...</p></div>`;

    try {
      const res = await fetch('/api/messages', {
        headers: { Authorization: 'Bearer ' + inboxToken }
      }).then((r) => r.json());

      if (!res.success) throw new Error(res.message);

      const msgs = res.data;
      const unread = msgs.filter((m) => !m.is_read).length;
      $('#unreadCount').textContent = unread;

      if (!msgs.length) {
        box.innerHTML = `<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>No messages yet. When customers fill the contact form, their messages will appear here.</p></div>`;
        return;
      }

      box.innerHTML = msgs.map((m, i) => `
        <div class="msg-card ${m.is_read ? '' : 'unread'}" style="animation-delay:${i * 70}ms">
          <div class="msg-top">
            <div class="msg-avatar">${m.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</div>
            <div class="msg-meta">
              <b>${m.name}</b>
              <span>${m.email}${m.phone ? ' • ' + m.phone : ''}</span>
            </div>
          </div>
          ${m.subject ? `<div class="msg-subject">Subject: ${m.subject}</div>` : ''}
          <div class="msg-text">${m.message}</div>
          <div class="msg-actions">
            <button class="mini-btn read" data-read="${m.id}"><i class="fa-solid fa-${m.is_read ? 'envelope-open' : 'envelope'}"></i> ${m.is_read ? 'Unread' : 'Read'}</button>
            <a class="mini-btn reply" href="mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your message')}"><i class="fa-solid fa-reply"></i> Reply</a>
            <button class="mini-btn del" data-mdel="${m.id}"><i class="fa-solid fa-trash"></i></button>
          </div>
          <div style="color:var(--muted);font-size:0.72rem;margin-top:10px;"><i class="fa-regular fa-clock"></i> ${new Date(m.created_at).toLocaleString()}</div>
        </div>`).join('');

      /* Mark read/unread */
      box.querySelectorAll('[data-read]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const res = await fetch(`/api/messages/${btn.dataset.read}/read`, {
            method: 'PATCH',
            headers: { Authorization: 'Bearer ' + inboxToken }
          }).then((r) => r.json());
          if (res.success) { toast(res.message, 'info'); loadMessages(); }
          else toast(res.message, 'error');
        });
      });

      /* Delete message */
      box.querySelectorAll('[data-mdel]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this message permanently?')) return;
          const res = await fetch(`/api/messages/${btn.dataset.mdel}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + inboxToken }
          }).then((r) => r.json());
          if (res.success) { toast(res.message, 'success'); loadMessages(); }
          else toast(res.message, 'error');
        });
      });
    } catch (err) {
      box.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${err.message || 'Failed to load messages.'}</p></div>`;
    }
  }

  $('#inboxLogoutBtn').addEventListener('click', () => {
    logout('inbox');
    toast('Logged out of inbox.', 'info');
  });

  /* Restore sessions on page load */
  window.addEventListener('DOMContentLoaded', () => {
    if (adminToken) { /* session will be verified when opened */ }
  });
})();

/* ═══════════ BOOT ═══════════ */
document.addEventListener('DOMContentLoaded', loadProjects);