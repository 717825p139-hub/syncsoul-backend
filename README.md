# 💕 SYNC SOUL — MongoDB Backend Setup

## Architecture
```
Browser (HTML/CSS/JS)
        │  fetch()
        ▼
Express Server  (server.js  :3000)
        │  mongoose
        ▼
MongoDB  (local or Atlas)
```

## Prerequisites
- Node.js 18+
- MongoDB **local** OR a free **MongoDB Atlas** cluster
- A Gmail account (for OTP emails — enable 2FA + generate an App Password)

---

## 1. Install dependencies
```bash
npm install
```

## 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:

```
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/syncsoul

# OR Atlas (replace with your connection string)
# MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/syncsoul

PORT=3000

# Gmail credentials for OTP
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password   # NOT your normal Gmail password
```

### Getting a Gmail App Password
1. Google Account → Security → 2-Step Verification → **App passwords**
2. Choose "Mail" + "Windows Computer" → Generate
3. Copy the 16-character password into `EMAIL_PASS`

---

## 3. Start the server
```bash
# Development (auto-restart on change)
npm run dev

# Production
npm start
```

---

## 4. Open the app
```
http://localhost:3000/frontpage.html
```

---

## File Structure
```
syncsoul-backend/
├── server.js          ← Express + MongoDB API
├── package.json
├── .env               ← your secrets (never commit this)
├── .env.example       ← template
└── public/            ← all frontend files served statically
    ├── frontpage.html
    ├── login.html
    ├── home.html
    ├── backjs.js      ← updated: calls API instead of localStorage
    └── backcss.css
```

---

## API Endpoints

| Method | Path                   | Description                        |
|--------|------------------------|------------------------------------|
| POST   | /api/register          | Validate user & send OTP           |
| POST   | /api/verify-otp        | Confirm OTP → save user to MongoDB |
| POST   | /api/login             | Authenticate user                  |
| POST   | /api/forgot-password   | Send password-reset OTP            |
| POST   | /api/reset-password    | Verify OTP & update password       |
| GET    | /api/profiles          | Fetch all profiles                 |

---

## Security improvements over the original
| Before (localStorage) | After (MongoDB) |
|---|---|
| Passwords stored as `btoa()` (reversible) | Passwords hashed with **bcrypt** (irreversible) |
| All data stored in the browser | Data stored securely on the server |
| Any user can read other users' passwords | Only hashed passwords are stored |
| No server-side validation | Full server-side validation on every request |
| OTP sent via third-party EmailJS | OTP sent directly via **Nodemailer** |
