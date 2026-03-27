// Shared utilities used across all pages

// ── Toast notifications ───────────────────────────────────────────────
function toast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  container.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 0.4s';
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 400);
  }, 3200);
}

// ── Deploy notification ───────────────────────────────────────────────
function notifyDeploying() {
  let bar = document.getElementById('deploy-bar');
  if (bar) bar.remove(); // reset if already showing

  bar = document.createElement('div');
  bar.id = 'deploy-bar';
  bar.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;z-index:998;
    background:#1E293B;color:white;
    display:flex;align-items:center;justify-content:center;gap:12px;
    padding:13px 20px;font-family:'Nunito',sans-serif;font-size:0.9rem;font-weight:700;
    box-shadow:0 -4px 20px rgba(0,0,0,0.2);
    animation:slideUp 0.3s ease;
  `;
  bar.innerHTML = `
    <span style="font-size:1.1rem;animation:spin 1.2s linear infinite;display:inline-block">⏳</span>
    <span>GitHub is deploying your changes — takes about <strong>30 seconds</strong>…</span>
  `;
  document.body.appendChild(bar);

  // Add spin animation if not already in page
  if (!document.getElementById('deploy-bar-styles')) {
    const s = document.createElement('style');
    s.id = 'deploy-bar-styles';
    s.textContent = `
      @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
      @keyframes spin    { to{transform:rotate(360deg)} }
    `;
    document.head.appendChild(s);
  }

  setTimeout(() => {
    if (!document.getElementById('deploy-bar')) return;
    bar.style.background = '#166534';
    bar.innerHTML = `
      <span style="font-size:1.1rem">✅</span>
      <span>Update complete! Refresh to see the latest changes.</span>
      <button onclick="location.reload()" style="
        background:white;color:#166534;border:none;border-radius:999px;
        padding:6px 16px;font-weight:800;font-size:0.85rem;cursor:pointer;
        font-family:'Nunito',sans-serif;margin-left:4px;
      ">🔄 Refresh</button>
      <button onclick="document.getElementById('deploy-bar').remove()" style="
        background:transparent;color:rgba(255,255,255,0.7);border:none;
        font-size:1.1rem;cursor:pointer;padding:0 4px;margin-left:4px;
      ">✕</button>
    `;
  }, 30000);
}

// ── Navigation ────────────────────────────────────────────────────────
function initNav() {
  const path = window.location.pathname;
  let active = 'calendar';
  if (path.includes('birthdays')) active = 'birthdays';
  else if (path.includes('emails')) active = 'emails';
  else if (path.includes('settings')) active = 'settings';

  const nav = document.getElementById('app-nav');
  if (!nav) return;

  const links = [
    { id: 'calendar',   href: 'index.html',      label: '📅 Calendar' },
    { id: 'birthdays',  href: 'birthdays.html',   label: '🎂 Birthdays' },
    { id: 'emails',     href: 'emails.html',      label: '📧 Emails' },
    { id: 'settings',   href: 'settings.html',    label: '⚙️ Settings' },
  ];

  nav.innerHTML = `
    <a class="nav-brand" href="index.html"><span>🎂</span> Joshua Fellowship Birthday Calendar</a>
    ${links.map(l => `<a href="${l.href}" class="nav-link ${l.id === active ? 'active' : ''}">${l.label}</a>`).join('')}
  `;

  // Show config warning if not set up
  if (!API.isConfigured() && active !== 'settings') {
    const banner = document.getElementById('config-banner');
    if (banner) banner.style.display = 'flex';
  }
}

// ── Date helpers ──────────────────────────────────────────────────────
function formatDate(year, month, day) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = months[parseInt(month) - 1] || '?';
  const y = year ? `, ${year}` : '';
  return `${m} ${parseInt(day)}${y}`;
}

function getAge(year) {
  if (!year) return null;
  return new Date().getFullYear() - parseInt(year);
}

function daysUntil(month, day) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next - today) / 86400000);
}

function isBirthdayToday(month, day) {
  const now = new Date();
  return parseInt(month) === now.getMonth() + 1 && parseInt(day) === now.getDate();
}

function upcomingLabel(days) {
  if (days === 0) return { text: '🎉 Today!', cls: 'badge-pink' };
  if (days === 1) return { text: '🌟 Tomorrow', cls: 'badge-purple' };
  if (days <= 7)  return { text: `📅 In ${days} days`, cls: 'badge-blue' };
  return { text: `${days} days`, cls: 'badge-yellow' };
}

function genderEmoji(gender) {
  if (gender === 'female') return '👧';
  return '👦';
}

function avatarBg(gender) {
  if (gender === 'female') return '#FFE4F0';
  return '#E0F2FE';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Modal helpers ─────────────────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

// Close on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initNav);
