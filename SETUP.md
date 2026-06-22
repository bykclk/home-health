# Home Health — setup & run

A React Native + Expo (SDK 56) household cleaning tracker. UI in Turkish/English
(i18n), cloud sync + sharing via Supabase, Apple/Google sign-in.

## 1. Install

```bash
npm install
cp .env.example .env   # then fill in the values (see below)
```

## 2. Run the UI now (no backend, no auth)

The whole app runs on in-memory seed data — great for design/UI work, works in
Expo Go and the browser:

```bash
EXPO_PUBLIC_USE_MOCK=1 npx expo start      # press w for web, or scan with Expo Go
```

## 3. Database (already provisioned)

The schema lives in `supabase/migrations/` and is applied to the linked project
(`supabase db push`). To re-apply or push to a new project:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

It creates the tables, household-scoped RLS, the `create_household` /
`join_household` RPCs, a new-user profile trigger, and the realtime publication.

## 4. Real auth + live sync (Apple & Google)

Native Apple/Google sign-in needs a **development build** — it does **not** run
in Expo Go or on web.

### a. Supabase Auth providers
In the Supabase dashboard → Authentication → Providers:
- **Apple**: enable it. Under "Authorized Client IDs" add the app bundle id
  `com.bykclk.homehealth` (for native ID-token sign-in).
- **Google**: enable it. Add your **Web** and **iOS** OAuth client IDs to
  "Authorized Client IDs".

### b. Google Cloud credentials
Create OAuth client IDs (Google Cloud Console → APIs & Services → Credentials):
- **Web client** → put in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- **iOS client** (bundle id `com.bykclk.homehealth`) → put in
  `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- Add the iOS client's **reversed** id as the URL scheme in `app.json`:
  ```json
  ["@react-native-google-signin/google-signin", { "iosUrlScheme": "com.googleusercontent.apps.YOUR-IOS-ID" }]
  ```

### c. Apple
- An Apple Developer account with **Sign in with Apple** enabled for the app id.
  `app.json` already sets `ios.usesAppleSignIn: true`.

### d. Build & run the dev client
```bash
npm install -g eas-cli      # or use npx
eas login
eas build --profile development --platform ios     # and/or android
# install the build on a device/simulator, then:
npx expo start --dev-client
```

## Architecture notes
- `src/lib/data.ts` switches between the seed store (`store.ts`) and the
  Supabase layer (`remote.ts`) based on `USE_MOCK`. Screens import only from
  `@/lib/data`, so they are agnostic to the source.
- `src/lib/health.ts` is the pure decay/score logic (no React, no i18n).
- `src/lib/auth.tsx` handles sessions; native sign-in modules are imported
  lazily so the mock/web path stays loadable.
- All UI strings live in `src/locales/{en,tr}.json`; code is English-only.
