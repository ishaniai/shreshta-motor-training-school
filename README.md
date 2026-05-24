# Shreshta Motor Training School

Modern Android application (APK) for driving training registration and appointment scheduling.

## Tech stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native (Expo) + TypeScript + NativeWind |
| Backend | Node.js + Express *(steps 2+)* |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + custom `users` table *(login step)* |
| Notifications | Nodemailer/Resend + Twilio WhatsApp *(later steps)* |

## Monorepo layout

```
shreshta-motor-training-school/
├── mobile/                 # Expo React Native app (APK target)
├── backend/                # Express API (placeholder until step 2+)
├── supabase/
│   └── migrations/         # SQL schema scripts
├── .env.example            # Root env template
└── README.md
```

## Development sequence

1. **Step 1** — Project structure, Supabase schema, Registration UI ✅  
2. **Step 2** — Registration backend, validation, Supabase integration ✅  
3. **Step 3** — Login Page UI ✅  
4. **Step 4 (current)** — Login auth (JWT) + Home dashboard ✅  
5. **Step 5** — Email on registration (Resend / Nodemailer) ✅  
6. **Step 6** — WhatsApp on registration (Twilio) ✅  
7. **Step 7** — APK build (EAS) — see [mobile/BUILD_APK.md](mobile/BUILD_APK.md) ✅  

## Quick start (mobile — after `npm install` in `mobile/`)

```bash
cd mobile
npm install
npx expo start
```

## Deploy backend

**[backend/DEPLOY.md](backend/DEPLOY.md)** — Render, Railway, or Docker.  
Privacy policy for Play Store: `https://YOUR_API_URL/privacy`

## Google Play Store

**[mobile/PLAY_STORE.md](mobile/PLAY_STORE.md)** — full publishing guide (AAB, listing, review).

```bash
cd mobile
eas build -p android --profile production   # .aab for Play Store
```

## Build Android APK (testing)

**[mobile/BUILD_APK.md](mobile/BUILD_APK.md)**

```bash
cd mobile
eas build -p android --profile preview
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).  
2. Run the SQL in `supabase/migrations/20250518000000_create_users_table.sql` via the SQL Editor.  
3. Copy keys into `mobile/.env` (see `mobile/.env.example`) when connecting in step 2.

## Dark mode

The mobile app uses a dark automobile-themed palette by default.
