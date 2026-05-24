# Build Android APK — Shreshta Motor Training School

This app uses **Expo SDK 52** and **EAS Build** (Expo Application Services) to produce installable `.apk` files.

---

## Before you build

### 1. Deploy the backend (required for a real app)

The mobile app calls `EXPO_PUBLIC_API_URL`. A release APK **cannot** use `localhost` or `10.0.2.2`.

Deploy the Express API (`backend/`) to a public host, for example:

- [Railway](https://railway.app)
- [Render](https://render.com)
- [Fly.io](https://fly.io)
- A VPS with Node + PM2 + HTTPS (nginx + Let's Encrypt)

Set all backend env vars on the host (Supabase, JWT, Resend, Twilio, etc.).

Example production URL: `https://api.shreshta-motors.example.com`

### 2. Point the app at your API

Edit `mobile/eas.json` → `preview` and `production` profiles:

```json
"env": {
  "EXPO_PUBLIC_API_URL": "https://api.shreshta-motors.example.com"
}
```

Or set secrets in EAS (recommended for teams):

```bash
cd mobile
eas secret:create --name EXPO_PUBLIC_API_URL --value https://your-api.com --type string
```

Then reference in `eas.json` or use EAS environment variables in the dashboard.

### 3. Accounts & tools

| Tool | Install |
|------|---------|
| Node.js 18+ | [nodejs.org](https://nodejs.org) |
| Expo account | [expo.dev/signup](https://expo.dev/signup) |
| EAS CLI | `npm install -g eas-cli` |

---

## One-time EAS project setup

```bash
cd mobile
npm install
eas login
eas init
```

`eas init` links the app to your Expo account and writes a real `projectId` into `app.json` under `extra.eas.projectId` (replace `REPLACE_AFTER_eas_init`).

---

## Build an APK (internal testing / sideload)

The **`preview`** profile outputs a downloadable **`.apk`**.

```bash
cd mobile
eas build -p android --profile preview
```

Or use the npm script:

```bash
npm run build:apk
```

1. EAS runs the build in the cloud (about 10–20 minutes the first time).
2. Open the build URL printed in the terminal or go to [expo.dev](https://expo.dev) → your project → **Builds**.
3. Download the **`.apk`** when the build status is **Finished**.
4. Transfer the APK to an Android phone and install (enable **Install unknown apps** for your file manager if prompted).

---

## Build for Google Play (AAB, not APK)

Play Store requires an **Android App Bundle** (`.aab`):

```bash
cd mobile
eas build -p android --profile production
```

Download the `.aab` from the EAS dashboard and upload to [Google Play Console](https://play.google.com/console).

---

## Version updates

Before each store release, bump in `app.json`:

```json
"version": "1.0.1",
"android": { "versionCode": 2 }
```

With `"appVersionSource": "remote"` in `eas.json`, EAS can auto-increment `versionCode` on **production** builds.

---

## Local APK build (advanced, optional)

Requires Android Studio + JDK. Generates native `android/` folder.

```bash
cd mobile
npx expo prebuild --platform android
npx expo run:android --variant release
```

APK output (typical path):

`android/app/build/outputs/apk/release/app-release.apk`

For local release builds you must still set `EXPO_PUBLIC_API_URL` in a `.env` file before prebuild, or export it in the shell.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Registration/login fails on device | `EXPO_PUBLIC_API_URL` must be HTTPS and reachable; backend must allow CORS or same-origin mobile calls |
| Build fails on credentials | Run `eas build -p android --profile preview` and follow prompts to create a Keystore (EAS can manage it) |
| `projectId` missing | Run `eas init` in `mobile/` |
| Notifications not sent | Configure `backend/.env` on the **deployed** server, not only locally |
| APK won’t install | Uninstall older test builds with the same `package` (`com.shreshta.motortraining`) |

---

## Checklist before sharing the APK

- [ ] Backend deployed with HTTPS  
- [ ] `EXPO_PUBLIC_API_URL` set in EAS / `eas.json`  
- [ ] Supabase migration applied  
- [ ] `eas init` completed  
- [ ] Test registration → email + WhatsApp on production backend  
- [ ] Test login → home → logout on a physical device  

---

## App identity

| Field | Value |
|-------|--------|
| App name | Shreshta Motor Training School |
| Android package | `com.shreshta.motortraining` |
| Slug | `shreshta-motor-training` |
