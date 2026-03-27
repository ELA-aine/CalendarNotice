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
    <a class="nav-brand" href="index.html"><span>🎂</span> BirthdayNotice</a>
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
  if (gender === 'male')   return '👦';
  if (gender === 'female') return '👧';
  return '🧑';
}

function avatarBg(gender) {
  if (gender === 'male')   return '#E0F2FE';
  if (gender === 'female') return '#FFE4F0';
  return '#F3E8FF';
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
