# School Monitor — Mobile (Field Data Collection)

Expo (React Native) app for field officers/inspectors to register institutions and log
facility conditions from the field, with offline-first submission.

## Why Expo

This uses Expo's managed workflow rather than bare React Native, since it doesn't need
any custom native modules — everything here (GPS, secure storage, async storage) has an
Expo-maintained package. That means you don't need Xcode or Android Studio installed to
develop: `npx expo start` gives you a QR code you can scan with the **Expo Go** app on
your own phone for instant testing. Native builds (for actual app store distribution)
happen via **EAS Build**, Expo's cloud build service, so you never need a Mac to build
the iOS version.

## Local development

```bash
cd apps/mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `a`/`i` in the terminal to open an
Android/iOS simulator if you have one installed.

## Configuring the API URL

The API URL is set in `app.json` under `expo.extra.apiUrl`. Update it to point at your
deployed API:

```json
"extra": {
  "apiUrl": "https://your-api-service.up.railway.app/api/v1"
}
```

Unlike the web app's Vite build, this value is read at *runtime* via `expo-constants`,
not baked in at build time — so you can change it without rebuilding, as long as you're
running via `expo start` (a published/built app does bundle it in, same caveat as the
web app applies to production builds).

## Offline-first behavior

- **Institutions and facility records created while offline** (or when the API request
  fails for any reason) are queued locally via `AsyncStorage` rather than lost.
- The app auto-attempts a sync whenever it returns to the foreground, and the
  Institution List screen shows a "records waiting to sync" banner with a manual
  **Sync now** button.
- Queued records retry up to 5 times before being left in the queue permanently visible
  (never silently dropped) — field-collected data is treated as too valuable to discard
  automatically.

## What's not built yet (next steps)

- **Photo capture for facility records** — the backend doesn't have a media upload
  endpoint yet (object storage integration), so this app doesn't attempt photo capture
  to avoid a UI that has nowhere to send its data. Add an S3-compatible upload endpoint
  to the API first, then wire up `expo-image-picker` here.
- **Dynamic inspection forms** — Phase 2 work; the backend already has an `Inspection`
  model with a JSON `responses` field for tenant-defined checklists, but there's no
  form-builder or dynamic-rendering UI yet, mobile or web.
- **Sign-in persistence testing on real devices** — token storage uses `expo-secure-store`
  (iOS Keychain / Android Keystore), which behaves differently in Expo Go vs. a real
  standalone build; worth a final check before distributing to field staff.

## Building for distribution (EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # or ios
```

This requires an Expo account (free) and produces an installable `.apk`/`.aab` or
`.ipa` without needing local native toolchains.
