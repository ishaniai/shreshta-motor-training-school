# Shreshta Backend (Express)

Handles registration and username checks against Supabase.

## Setup

1. Copy `.env.example` → `.env` and set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (Dashboard → Settings → API)

2. Ensure the SQL migration in `../supabase/migrations/` has been applied.

```bash
cd backend
npm install
npm run dev
```

API base: `http://localhost:3000`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/username-available?username=` | Real-time username check |
| POST | `/api/auth/register` | Register user (bcrypt password hash) |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Current user (Bearer token) |

## Registration email

On successful registration, the API emails `NOTIFY_EMAIL_TO` (default: `sumitdubey182019@gmail.com`) with:

- Registrant details (name, username, contact, email, DOB, address)
- Vehicle training preference
- License details (if applicable)

**Resend (recommended):**

1. Create an API key at [resend.com](https://resend.com).
2. Set `RESEND_API_KEY` and `EMAIL_FROM` (verified domain or `onboarding@resend.dev` for testing).

**SMTP (Nodemailer):** set `EMAIL_PROVIDER=smtp` and `SMTP_*` variables.

Disable emails: `EMAIL_NOTIFICATIONS_ENABLED=false`

## Registration WhatsApp (Twilio)

On successful registration, a WhatsApp message is sent to `NOTIFY_WHATSAPP_TO` (default: `+91 7017898615`) with the same registrant, training, and license details as the email.

1. Get credentials from [Twilio Console](https://console.twilio.com).
2. For testing, use the [WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn): set `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886` and have the recipient send the join code to the sandbox number.
3. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and ensure `NOTIFY_WHATSAPP_TO=whatsapp:+917017898615`.

Disable: `WHATSAPP_NOTIFICATIONS_ENABLED=false`

## Mobile connection

- **Android emulator:** `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`
- **Physical device (same Wi‑Fi):** use your computer's LAN IP, e.g. `http://192.168.1.10:3000`
