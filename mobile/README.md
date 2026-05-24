# Shreshta Motor Training — Mobile (Expo)

React Native + Expo + NativeWind (Tailwind) + TypeScript.

## Step 4 status (Login auth + Home)

- `POST /api/auth/login` → JWT stored in **expo-secure-store**  
- Invalid credentials → red: `Incorrect user/ password combination, try again !`  
- Success → `/home` — Schedule Training Appointment  
- Home: green success line, disclaimer, **Logout** → clears session → `/login`  
- Registration email + WhatsApp sent from backend — configure `backend/.env`  
- **APK build:** see [BUILD_APK.md](./BUILD_APK.md)  

## Step 2 (done)

- Registration saves via Express → Supabase (`password_hash` with bcrypt)  
- Real-time username check: `GET /api/auth/username-available`  
- Success screen: “Registered successfully” + **Click here** → Login  

## Run (full registration flow)

**Terminal 1 — backend:**
```bash
cd ../backend
cp .env.example .env   # add Supabase keys
npm install
npm run dev
```

**Terminal 2 — mobile:**
```bash
cp .env.example .env
npm install
npx expo start
```

## Install & run

```bash
cd mobile
npm install
npx expo start
```

Press `a` for Android emulator or scan QR with Expo Go.

## Assets

If `assets/icon.png` is missing, run:

```bash
npx expo install expo-asset
```

Or copy default icons from a fresh `npx create-expo-app` template into `assets/`.

## Path alias

`@/*` maps to `src/*` (see `tsconfig.json`).
