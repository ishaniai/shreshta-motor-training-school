# Publish to Google Play Store

Guide for **Shreshta Motor Training School** (`com.shreshta.motortraining`).

---

## Overview

| Step | What |
|------|------|
| 1 | Google Play Developer account |
| 2 | Deploy backend (HTTPS) + privacy policy URL |
| 3 | Configure `EXPO_PUBLIC_API_URL` in EAS |
| 4 | Build **AAB** with EAS (`production` profile) |
| 5 | Create app in Play Console + store listing |
| 6 | Upload AAB + complete policies |
| 7 | Submit for review |

Play Store requires an **Android App Bundle (`.aab`)**, not an APK.

---

## Prerequisites

### 1. Google Play Developer account

- Sign up: [play.google.com/console/signup](https://play.google.com/console/signup)
- One-time fee: **$25 USD**
- Complete identity verification (can take 24–48 hours)

### 2. Backend deployed with HTTPS

The app must reach your API in production. See `backend/DEPLOY.md` (if present) or deploy to Render/Railway/Fly.io.

After deploy, verify:

```bash
curl https://YOUR_API_URL/api/health
# → {"status":"ok","service":"shreshta-backend"}

curl https://YOUR_API_URL/privacy
# → HTML privacy policy (required for Play Console)
```

### 3. Expo / EAS

```bash
npm install -g eas-cli
cd mobile
npm install
eas login
eas init
```

---

## Step 1 — Configure production API URL

Edit `mobile/eas.json` → `production.env`:

```json
"EXPO_PUBLIC_API_URL": "https://your-real-api.onrender.com"
```

**Recommended:** use EAS Secrets instead of committing URLs:

```bash
cd mobile
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://your-api.com --type string
```

Remove the hardcoded `env` block from `eas.json` if you use secrets (EAS injects them at build time).

---

## Step 2 — Build the release AAB

```bash
cd mobile
eas build -p android --profile production
```

Or:

```bash
npm run build:android
```

- First build: EAS prompts to create an **Android Keystore** → choose **Let EAS manage credentials** (recommended).
- Wait for status **Finished** on [expo.dev](https://expo.dev) → **Builds**.
- Download the `.aab` (or use `eas submit` in Step 4).

`production` profile settings (in `eas.json`):

- `buildType: app-bundle` → Play-compatible AAB
- `autoIncrement: true` → bumps `versionCode` each build

Bump user-visible version in `app.json` when releasing features:

```json
"version": "1.0.1"
```

---

## Step 3 — Create the app in Play Console

1. Open [Google Play Console](https://play.google.com/console).
2. **Create app**
   - App name: **Shreshta Motor Training School**
   - Default language: English (India) or your choice
   - App or game: **App**
   - Free or paid: **Free**
3. Accept declarations and create the app.

### App identity (must match `app.json`)

| Field | Value |
|-------|--------|
| Package name | `com.shreshta.motortraining` |
| Cannot be changed later | Yes |

---

## Step 4 — Store listing (copy from `store-listing/`)

Fill **Main store listing**:

| Asset | Requirement |
|-------|-------------|
| Short description | Max 80 characters — see `store-listing/short-description.txt` |
| Full description | Max 4000 characters — see `store-listing/full-description.txt` |
| App icon | 512×512 PNG — use `assets/icon.png` resized |
| Feature graphic | **1024×500** JPG/PNG (required) |
| Phone screenshots | Min **2**, recommended 4–8 (1080×1920 or similar) |

Take screenshots from a real device or emulator: Registration, Login, Home.

### Privacy policy URL (required)

Use your deployed backend:

```
https://YOUR_API_URL/privacy
```

Example: `https://shreshta-api.onrender.com/privacy`

---

## Step 5 — Policy and programs

Complete all required items under **Policy and programs**:

### Data safety

Declare data collected (matches registration form):

- Name, email, phone, address, date of birth
- User IDs / account info
- Data encrypted in transit (HTTPS)
- Purpose: app functionality, account management
- Optional: note admin notifications (email/WhatsApp) for new registrations

### Content rating

1. Start questionnaire → category **Utility** or **Education**.
2. Answer honestly (no violence, etc.).
3. Apply generated rating (usually **Everyone** or low teen depending on answers).

### Target audience

- Select age groups appropriate for 18+ registration app.
- Not primarily for children.

### News app / COVID / Ads

- Decline unless applicable.

---

## Step 6 — Upload the AAB

### Option A — Manual upload

1. Play Console → **Release** → **Production** (or **Internal testing** first).
2. **Create new release** → Upload the `.aab` from EAS.
3. Add release notes, e.g. `Initial release — registration and login.`
4. Save (do not publish yet until all checks pass).

### Option B — EAS Submit (automated)

1. Play Console → **Setup** → **API access** → Link Google Cloud project.
2. Create a **service account** with **Release to production** (or Admin) permission.
3. Download JSON key → save as `mobile/google-service-account.json` (add to `.gitignore`).
4. Run:

```bash
cd mobile
eas submit -p android --profile production --latest
```

Configure `eas.json` submit block if needed:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-service-account.json",
      "track": "internal"
    }
  }
}
```

Start with **`internal`** testing, then promote to **production**.

---

## Step 7 — Internal testing (recommended first)

1. **Release** → **Testing** → **Internal testing**.
2. Upload AAB → add testers (email list).
3. Testers install via Play Store link.
4. Verify: register → email/WhatsApp → login → home → logout.

Fix bugs, bump version, rebuild AAB, upload again.

---

## Step 8 — Production release

When internal testing passes:

1. **Release** → **Production** → **Create new release**.
2. Promote tested bundle or upload new AAB.
3. Complete **Publishing overview** (all green checks).
4. **Send for review** (review often takes 1–7 days).

---

## Checklist before “Send for review”

- [ ] Backend live + `/api/health` OK  
- [ ] `EXPO_PUBLIC_API_URL` points to production API in EAS build  
- [ ] Privacy policy URL live (`/privacy`)  
- [ ] AAB uploaded  
- [ ] Store listing + icon + feature graphic + screenshots  
- [ ] Data safety form completed  
- [ ] Content rating received  
- [ ] Target API level meets Play requirements (Expo SDK 52 handles this)  
- [ ] Tested login/registration on internal track  

---

## Updating the app later

1. Bump `version` in `app.json`.
2. `eas build -p android --profile production` (auto-increments `versionCode`).
3. Upload new AAB or `eas submit --latest`.
4. Add release notes in Play Console.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Play rejects package name | Must be `com.shreshta.motortraining` — create new app if wrong |
| App crashes on open | Wrong `EXPO_PUBLIC_API_URL` in production build |
| Privacy policy required | Set URL to `https://YOUR_API/privacy` |
| Upload key mismatch | Use same EAS credentials; never lose keystore |
| `versionCode` already used | Run production build again with `autoIncrement` |

---

## Related docs

- [BUILD_APK.md](./BUILD_APK.md) — APK for sideload / testers  
- [../backend/README.md](../backend/README.md) — API env vars  
- [store-listing/](./store-listing/) — Play Store text templates  
