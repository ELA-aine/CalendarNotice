#!/usr/bin/env node
/**
 * Birthday Email Mailer
 * Reads docs/data/birthdays.json and docs/data/emails.json,
 * finds birthdays happening today or within DAYS_AHEAD days,
 * and sends a warm notification email to every address in the list.
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const DAYS_AHEAD = parseInt(process.env.DAYS_AHEAD || '3', 10);
const DRY_RUN         = process.env.DRY_RUN === 'true';
const TEST_MODE       = process.env.TEST_MODE === 'true';
const TEST_RECIPIENT  = (process.env.TEST_RECIPIENT || '').trim();

// ── Helpers ───────────────────────────────────────────────────────────
function daysUntilBirthday(month, day) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next - today) / 86400000);
}

function formatOrdinal(n) {
  const s = ['th','st','nd','rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function monthName(m) {
  return ['January','February','March','April','May','June',
          'July','August','September','October','November','December'][m - 1];
}

function buildEmailHtml(upcoming) {
  const rows = upcoming.map(b => {
    const days = daysUntilBirthday(b.month, b.day);
    const age  = b.year ? (new Date().getFullYear() - b.year + (days === 0 ? 0 : 1)) : null;
    const genderIcon = b.gender === 'male' ? '👦' : b.gender === 'female' ? '👧' : '🧑';
    const faithLine = b.christian
      ? `<p style="color:#7C3AED;margin:6px 0 0">✝️ May God bless ${b.name} abundantly on this special day! 🙏</p>`
      : `<p style="color:#0284C7;margin:6px 0 0">🌸 Wishing ${b.name} a joyful and wonderful birthday! 🎉</p>`;

    const daysLabel = days === 0 ? '🎉 <strong>TODAY!</strong>'
                    : days === 1 ? '🌟 Tomorrow'
                    : `📅 In ${days} days`;

    return `
      <div style="background-color:#FBCFE8;background-image:linear-gradient(135deg,#FCE7F3,#F9A8D4);border:1.5px solid #F472B6;border-radius:12px;padding:16px 20px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span style="font-size:1.4rem">${genderIcon}</span>
          <div>
            <strong style="font-size:1.05rem;color:#374151">${b.name}</strong>
            ${age ? `<span style="background:#DCFCE7;color:#16A34A;border-radius:999px;padding:2px 10px;font-size:0.78rem;font-weight:700;margin-left:8px">🎂 Turning ${formatOrdinal(age)}</span>` : ''}
          </div>
          <span style="margin-left:auto;font-size:0.85rem;font-weight:700;color:#6B7280">${daysLabel}</span>
        </div>
        <p style="color:#6B7280;font-size:0.88rem;margin:0">📅 ${monthName(b.month)} ${b.day}${b.year ? ', ' + b.year : ''}</p>
        ${faithLine}
      </div>
    `;
  }).join('');

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#FFF0F8;margin:0;padding:20px">
  <div style="max-width:560px;margin:0 auto">

    <!-- Header -->
    <div style="background-color:#BE185D;background-image:linear-gradient(135deg,#F472B6,#BE185D);border-radius:18px 18px 0 0;padding:32px 32px;text-align:center">
      <div style="font-size:3rem;margin-bottom:10px">🎂</div>
      <h1 style="color:white;margin:0 0 8px;font-size:1.8rem;font-weight:900;letter-spacing:-0.02em">Birthday Reminder!</h1>
      <p style="color:white;margin:0;font-size:0.92rem;font-weight:600;background-color:#9D174D;display:inline-block;padding:4px 14px;border-radius:999px">${todayLabel}</p>
    </div>

    <!-- Body -->
    <div style="background:white;border-radius:0 0 18px 18px;padding:28px 32px;border:1.5px solid #FFE4F0;border-top:none">
      <p style="color:#374151;margin:0 0 20px;font-size:0.95rem">
        Hey there! 👋 Here are the upcoming birthdays you should know about:
      </p>

      ${rows}

      <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #FFE4F0">
        <p style="color:#9CA3AF;font-size:0.8rem;margin:0">
          Sent with 💕 by <strong>Joshua Fellowship Birthday Calendar</strong><br/>
          Automated birthday reminders via GitHub Actions
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function buildEmailText(upcoming) {
  const lines = upcoming.map(b => {
    const days = daysUntilBirthday(b.month, b.day);
    const age  = b.year ? (new Date().getFullYear() - b.year + (days === 0 ? 0 : 1)) : null;
    const daysLabel = days === 0 ? 'TODAY!' : days === 1 ? 'Tomorrow' : `In ${days} days`;
    const faithLine = b.christian
      ? `May God bless ${b.name} abundantly! 🙏`
      : `Wishing ${b.name} a wonderful birthday! 🎉`;
    return `• ${b.name} — ${monthName(b.month)} ${b.day}${b.year ? ', ' + b.year : ''} (${daysLabel})${age ? ` — Turning ${formatOrdinal(age)}` : ''}\n  ${faithLine}`;
  }).join('\n\n');

  return `🎂 Birthday Reminder\n${'='.repeat(40)}\n\n${lines}\n\n— Joshua Fellowship Birthday Calendar (GitHub Actions)`;
}

// ── Test mode email ───────────────────────────────────────────────────
function buildTestEmailHtml() {
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#FFF0F8;margin:0;padding:20px">
  <div style="max-width:560px;margin:0 auto">
    <div style="background-color:#BE185D;background-image:linear-gradient(135deg,#F472B6,#BE185D);border-radius:18px 18px 0 0;padding:32px 32px;text-align:center">
      <div style="font-size:3rem;margin-bottom:10px">🎉</div>
      <h1 style="color:#FFFFFF;margin:0 0 8px;font-size:2rem;font-weight:900;letter-spacing:-0.02em">Test Email — It works!</h1>
      <p style="color:#FFFFFF;margin:0;font-size:0.92rem;font-weight:600;background-color:#9D174D;display:inline-block;padding:4px 14px;border-radius:999px">${todayLabel}</p>
    </div>
    <div style="background:white;border-radius:0 0 18px 18px;padding:28px 32px;border:2px solid #FBBFD4;border-top:none">
      <p style="color:#374151;font-size:0.95rem;margin:0 0 16px">
        ✅ Your <strong>Joshua Fellowship Birthday Calendar</strong> email setup is working correctly!
      </p>
      <p style="color:#6B7280;font-size:0.88rem;margin:0 0 16px">
        This test email was triggered manually from the app. Real birthday notifications will be sent automatically every day at <strong>8:00 AM UTC</strong> when birthdays are coming up.
      </p>
      <div style="background-color:#FBCFE8;background-image:linear-gradient(135deg,#FCE7F3,#F9A8D4);border:1.5px solid #F472B6;border-radius:12px;padding:16px 20px;margin-bottom:16px">
        <div style="font-weight:700;color:#1F2937;margin-bottom:6px">🎂 Sample Birthday</div>
        <div style="color:#4B5563;font-size:0.88rem">Jane Doe — March 26 — 🎉 Today!</div>
        <div style="color:#7C3AED;font-size:0.88rem;margin-top:6px">✝️ May God bless Jane Doe abundantly on this special day! 🙏</div>
      </div>
      <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #FFE4F0">
        <p style="color:#9CA3AF;font-size:0.8rem;margin:0">
          Sent with 💕 by <strong>Joshua Fellowship Birthday Calendar</strong><br/>
          Automated birthday reminders via GitHub Actions
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log(`🎂 Birthday Mailer — ${new Date().toISOString()}`);
  console.log(`   Days ahead: ${DAYS_AHEAD} | Dry run: ${DRY_RUN} | Test mode: ${TEST_MODE}`);

  // Load data files
  const birthdaysPath = path.join(process.cwd(), 'docs/data/birthdays.json');
  const emailsPath    = path.join(process.cwd(), 'docs/data/emails.json');

  if (!fs.existsSync(birthdaysPath) || !fs.existsSync(emailsPath)) {
    console.log('❌ Data files not found. Exiting.');
    process.exit(1);
  }

  const birthdays  = JSON.parse(fs.readFileSync(birthdaysPath, 'utf8'));
  const allEmails  = JSON.parse(fs.readFileSync(emailsPath, 'utf8'));
  const emails     = allEmails.filter(e => e.active !== false);

  console.log(`   Loaded ${birthdays.length} birthdays, ${emails.length} active recipients (${allEmails.length} total)`);

  if (!emails.length) {
    console.log('ℹ️  No email recipients configured. Exiting.');
    return;
  }

  // ── Test mode: send a sample email and exit ──────────────────────────
  if (TEST_MODE) {
    console.log('🧪 TEST MODE — Sending sample email...');
    if (!GMAIL_USER || !GMAIL_PASS) {
      console.log('❌ GMAIL_USER or GMAIL_PASS secret not set. Exiting.');
      process.exit(1);
    }
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_PASS } });
    const toList = TEST_RECIPIENT || emails.map(e => e.email).join(', ');
    if (!toList) { console.log('ℹ️  No active recipients. Exiting.'); return; }
    if (TEST_RECIPIENT) console.log(`   Sending test to specified recipient: ${TEST_RECIPIENT}`);
    const info = await transporter.sendMail({
      from: `"🎂 Joshua Fellowship Birthday Calendar" <${GMAIL_USER}>`,
      to: toList,
      subject: '🎉 Joshua Fellowship Birthday Calendar — Test Email',
      html: buildTestEmailHtml(),
      text: '✅ Joshua Fellowship Birthday Calendar test email — your email setup is working correctly! Real birthday notifications will be sent automatically at 8:00 AM UTC.',
    });
    console.log(`✅ Test email sent! Message ID: ${info.messageId}`);
    console.log(`   Recipients: ${toList}`);
    return;
  }

  // Find upcoming birthdays within window
  const upcoming = birthdays
    .map(b => ({ ...b, _days: daysUntilBirthday(b.month, b.day) }))
    .filter(b => b._days <= DAYS_AHEAD)
    .sort((a, b) => a._days - b._days);

  console.log(`   Upcoming birthdays in next ${DAYS_AHEAD} days: ${upcoming.length}`);

  if (!upcoming.length) {
    console.log('ℹ️  No birthdays coming up. No emails to send.');
    return;
  }

  upcoming.forEach(b => console.log(`   🎂 ${b.name} — in ${b._days} day(s)`));

  if (DRY_RUN) {
    console.log('\n🧪 DRY RUN — Emails would have been sent to:');
    emails.forEach(e => console.log(`   📧 ${e.email}`));
    return;
  }

  if (!GMAIL_USER || !GMAIL_PASS) {
    console.log('❌ GMAIL_USER or GMAIL_PASS secret not set. Exiting.');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });

  const subject = upcoming.length === 1
    ? `🎂 Birthday Alert: ${upcoming[0].name}!`
    : `🎂 ${upcoming.length} Upcoming Birthdays!`;

  const toList = emails.map(e => e.email).join(', ');

  const mailOptions = {
    from: `"🎂 Joshua Fellowship Birthday Calendar" <${GMAIL_USER}>`,
    to: toList,
    subject,
    text: buildEmailText(upcoming),
    html: buildEmailHtml(upcoming),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent! Message ID: ${info.messageId}`);
    console.log(`   Recipients: ${toList}`);
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
