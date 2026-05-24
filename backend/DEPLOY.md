# Deploy Backend (Production)

Deploy the Express API so the Play Store app can call it over **HTTPS**.

---

## Required environment variables

Copy from `.env.example`. All of these must be set on your host:

| Variable | Required |
|----------|----------|
| `PORT` | Usually set by platform (e.g. `10000`) |
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `JWT_SECRET` | Yes — long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `RESEND_API_KEY` | If using email |
| `EMAIL_FROM` | Yes for email |
| `NOTIFY_EMAIL_TO` | Admin email |
| `TWILIO_ACCOUNT_SID` | If using WhatsApp |
| `TWILIO_AUTH_TOKEN` | If using WhatsApp |
| `TWILIO_WHATSAPP_FROM` | WhatsApp sender |
| `NOTIFY_WHATSAPP_TO` | `whatsapp:+917017898615` |

Optional: `CORS_ORIGINS` — not required for mobile-only (React Native does not use browser CORS the same way).

---

## Option A — Render (recommended for beginners)

1. Push code to GitHub.
2. [render.com](https://render.com) → **New** → **Web Service** → connect repo.
3. Settings:
   - **Root directory:** `backend`
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Instance:** Free or Starter
4. Add all environment variables in **Environment**.
5. Deploy → copy URL, e.g. `https://shreshta-api.onrender.com`.
6. Verify:
   ```bash
   curl https://shreshta-api.onrender.com/api/health
   curl https://shreshta-api.onrender.com/privacy
   ```
7. Use this URL as `EXPO_PUBLIC_API_URL` in EAS.

**Note:** Free tier sleeps after inactivity; first request may be slow. Use Starter for production.

---

## Option B — Railway

1. [railway.app](https://railway.app) → New project → Deploy from GitHub.
2. Set root to `backend` or use Dockerfile if monorepo.
3. Variables → paste env vars.
4. Generate domain → use as API URL.

---

## Option C — Docker (VPS / Fly.io / any cloud)

From repo root:

```bash
cd backend
docker build -t shreshta-api .
docker run -p 3000:3000 --env-file .env shreshta-api
```

Example `Dockerfile` is in `backend/Dockerfile`.

---

## After deploy

1. Run Supabase migration if not done (`supabase/migrations/...sql`).
2. Update `mobile/eas.json` production `EXPO_PUBLIC_API_URL`.
3. Rebuild Android: `eas build -p android --profile production`.
4. Play Console privacy policy: `https://YOUR_API/privacy`.

See [../mobile/PLAY_STORE.md](../mobile/PLAY_STORE.md) for Play Store steps.
