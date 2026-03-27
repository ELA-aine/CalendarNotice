# 🎂 Joshua Fellowship Birthday Calendar

A birthday notification web app for Joshua Fellowship. View birthdays on a calendar, manage the list, and receive automatic email reminders — all hosted for free on GitHub Pages.

**Live site:** https://ela-aine.github.io/CalendarNotice/

---

## ✨ Features

- 📅 **Calendar view** — see all birthdays at a glance
- 🎂 **Birthday management** — add, edit, delete, or import from CSV
- 📧 **Email notifications** — auto-send birthday emails to a list of recipients
- ✝️ **Faith-aware messages** — Christian birthdays get a faith-based greeting; others get a warm secular one
- 🔔 **Daily reminders** — GitHub Actions runs at 8:00 AM UTC and sends emails for upcoming birthdays

---

## 🚀 First-Time Setup

### 1. Enable GitHub Pages
1. Go to **Settings → Pages** in this repo
2. Source: **Deploy from a branch**
3. Branch: `main` / Folder: `/docs`
4. Click **Save**

### 2. Create a GitHub Personal Access Token (PAT)
1. Go to **github.com/settings/tokens** → Fine-grained token
2. Set repository access to **only this repo**
3. Under permissions, enable:
   - **Contents:** Read and Write
   - **Actions:** Read and Write
4. Generate and copy the token

### 3. Set up email sending (Gmail)
1. Enable 2-Step Verification on your Google account
2. Go to **myaccount.google.com/apppasswords** → generate an App Password
3. In this repo go to **Settings → Secrets and variables → Actions** and add:
   - `GMAIL_USER` — your Gmail address
   - `GMAIL_PASS` — the 16-character App Password

### 4. Configure the web app
1. Open the live site → go to **⚙️ Settings**
2. Enter your GitHub username, repo name (`CalendarNotice`), branch (`main`), and PAT
3. Click **Save Configuration** then **Test Connection**

---

## 📖 How to Use

### Adding a Birthday
1. Go to **🎂 Birthdays** → click **＋ Add Birthday**
2. Fill in name, month, day, year (optional), gender, and faith
3. Click **Save Birthday**

> ⏳ **Please wait ~30 seconds after saving** — the app writes data to GitHub, which then triggers a deployment. The new birthday will appear on the calendar after the page refreshes.

### Importing Birthdays from CSV
1. Go to **🎂 Birthdays** → click **📂 Import CSV**
2. Drag & drop or browse for your `.csv` file
3. The app auto-detects columns — supported names:
   - `name`, `month`, `day`, `year` (optional), `gender`, `christian`
4. Review the preview (duplicates are highlighted and skipped)
5. Click **✅ Import All**

Download a sample template from inside the import modal.

> ⏳ **Same as above — wait ~30 seconds after importing** for the deployment to complete.

### Managing Email Recipients
1. Go to **📧 Emails** → click **＋ Add Email**
2. Enter the email address and an optional label
3. Use **🧪 Send Test Email** to verify your Gmail setup is working

### Email Notifications
- Emails are sent automatically **every day at 8:00 AM UTC**
- Anyone with a birthday **today or within 3 days** triggers a notification
- All recipients on the email list receive the same email
- Christian birthdays include a faith-based message 🙏

---

## 🗂️ Data Storage

All data is stored as JSON files in this repo:
- `docs/data/birthdays.json` — birthday records
- `docs/data/emails.json` — notification email list

These files are updated directly via the GitHub API when you add or edit entries in the app. Your GitHub PAT is stored only in your browser's `localStorage` and is never sent anywhere except GitHub's API.

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Hosting | GitHub Pages (free) |
| Data | JSON files in repo via GitHub API |
| Calendar UI | FullCalendar 6 (CDN) |
| Email sending | GitHub Actions + Nodemailer + Gmail |
| Fonts | Nunito (Google Fonts) |
