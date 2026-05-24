# Local end-to-end testing guide

Yes — the app is **fully built** for local testing:

| Feature | Works locally? |
|---------|----------------|
| Registration (all fields + validation) | Yes |
| Real-time username check | Yes (needs backend + Supabase) |
| Save user to database | Yes |
| Login (username or email) | Yes |
| Home screen + logout | Yes |
| Email on register | Optional (disable without API keys) |
| WhatsApp on register | Optional (disable without Twilio) |

You need **3 pieces** running: **Supabase** (cloud), **backend** (your Mac), **mobile app** (Expo).

---

## Prerequisites

Install on your Mac:

- **Node.js 18+** — check: `node -v`
- **npm** — check: `npm -v`
- **Expo Go** on your phone *or* **Android Studio** emulator / **Xcode** iOS Simulator

Project folder:

```text
/Users/srijanu/shreshta-motor-training-school
```

---

## Part 1 — Supabase (database) ~10 min

### 1.1 Create a free project

1. Go to [supabase.com](https://supabase.com) → Sign up / Log in.
2. **New project** → pick name, password, region (e.g. Mumbai if available).
3. Wait until the project is ready.

### 1.2 Run the database migration

1. In Supabase Dashboard → **SQL Editor** → **New query**.
2. Open this file on your computer and copy all SQL:

   `supabase/migrations/20250518000000_create_users_table.sql`

3. Paste into the editor → **Run**.
4. Confirm: **Table Editor** → you should see table **`users`**.

### 1.3 Copy API keys

Dashboard → **Project Settings** → **API**:

| Key | Use in |
|-----|--------|
| **Project URL** | `SUPABASE_URL` in backend `.env` |
| **service_role** (secret) | `SUPABASE_SERVICE_ROLE_KEY` in backend `.env` |

Never put `service_role` in the mobile app.

---

## Part 2 — Backend (API) ~5 min

### 2.1 Create `.env`

```bash
cd /Users/srijanu/shreshta-motor-training-school/backend
cp .env.example .env
```

Edit `backend/.env` — minimum required:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-service-role-key...

JWT_SECRET=local-dev-secret-change-in-production
JWT_EXPIRES_IN=7d

# Disable notifications for first local test (no Resend/Twilio needed)
EMAIL_NOTIFICATIONS_ENABLED=false
WHATSAPP_NOTIFICATIONS_ENABLED=false
```

### 2.2 Install and start

```bash
cd /Users/srijanu/shreshta-motor-training-school/backend
npm install
npm run dev
```

You should see:

```text
Shreshta API listening on http://0.0.0.0:3000
```

### 2.3 Verify backend

New terminal:

```bash
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok","service":"shreshta-backend"}`

Leave this terminal running.

---

## Part 3 — Mobile app (Expo) ~5 min

### 3.1 Choose API URL

The phone/emulator must reach your Mac’s backend.

| How you run the app | `EXPO_PUBLIC_API_URL` in `mobile/.env` |
|---------------------|----------------------------------------|
| **Android emulator** | `http://10.0.2.2:3000` |
| **iOS Simulator** | `http://localhost:3000` |
| **Physical phone** (same Wi‑Fi) | `http://YOUR_MAC_IP:3000` |

Find Mac IP: **System Settings → Wi‑Fi → Details** or run `ipconfig getifaddr en0`.

Example `mobile/.env` for Android emulator:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

### 3.2 Install and start Expo

```bash
cd /Users/srijanu/shreshta-motor-training-school/mobile
cp .env.example .env
# Edit .env with the correct EXPO_PUBLIC_API_URL (see table above)

npm install
npx expo start
```

### 3.3 Open the app

In the Expo terminal:

- Press **`a`** — Android emulator  
- Press **`i`** — iOS Simulator  
- Or scan **QR code** with **Expo Go** on your phone (same Wi‑Fi; use Mac IP in `.env`)

---

## Part 4 — Test end-to-end

### Test 1 — Registration

1. App opens on **Registration** screen.
2. Fill the form (use age **18+** for date of birth).
3. Username: type 3+ characters → wait for green **“Username is available”**.
4. Tap **Submit**.
5. Expect: **“Registered successfully”** → tap **Click here** → Login screen.

Verify in Supabase: **Table Editor → users** → new row (no plain password stored).

### Test 2 — Login

1. Login with **username** (or **email**) + password.
2. Wrong password → red: `Incorrect user/ password combination, try again !`
3. Correct → **Home**: green `User landed home page successfully !`

### Test 3 — Logout

1. Tap **Logout** → back to Login.

### Test 4 — Clear form

On Registration, **Clear** resets all fields.

---

## Optional — Email & WhatsApp locally

Re-enable in `backend/.env` when you have keys:

```env
EMAIL_NOTIFICATIONS_ENABLED=true
RESEND_API_KEY=re_xxxx
EMAIL_FROM=Shreshta Motor Training <onboarding@resend.dev>

WHATSAPP_NOTIFICATIONS_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
```

Registration still **succeeds** if email/WhatsApp fail; check backend terminal for errors.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot reach server` on phone | Wrong `EXPO_PUBLIC_API_URL`; use Mac LAN IP for physical device |
| Backend won’t start | Missing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or `JWT_SECRET` in `.env` |
| Username check never turns green | Backend not running or wrong API URL |
| Registration 500 error | Supabase migration not applied or wrong service role key |
| Expo “network request failed” | Phone not on same Wi‑Fi as Mac; firewall blocking port 3000 |
| iOS Simulator can’t reach API | Use `http://localhost:3000` |
| Android emulator can’t reach API | Use `http://10.0.2.2:3000` not `localhost` |

### Restart everything

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — mobile
cd mobile && npx expo start
```

---

## What you do NOT need for local UI testing

- Google Play / EAS build  
- Deployed backend on Render  
- Resend / Twilio (if disabled in `.env`)  

---

## Quick command summary

```bash
# 1) Supabase: run SQL migration in dashboard (once)

# 2) Backend
cd /Users/srijanu/shreshta-motor-training-school/backend
cp .env.example .env   # then edit with Supabase keys
npm install && npm run dev

# 3) Mobile (new terminal)
cd /Users/srijanu/shreshta-motor-training-school/mobile
cp .env.example .env   # set EXPO_PUBLIC_API_URL
npm install && npx expo start
```
