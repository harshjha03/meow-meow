# Meow Meow 🐾

An offline-first **PWA for CAT exam prep tracking**. Log practice sessions and mocks,
track weekly section targets, keep a study streak, and plan study blocks — all stored
locally and working fully offline. Optional Google login adds cloud sync and Google
Calendar reminders.

## Stack
React + Vite · Tailwind CSS · Recharts · Supabase (auth + sync) · vite-plugin-pwa

## Quick start
```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build (PWA service worker generated here)
npm run preview      # preview the production build (test install / offline)
```

The app is **fully usable with zero configuration** — everything lives in `localStorage`.
The `.env` values below are optional and only enable the cloud features.

## Optional: cloud sync + Google Calendar
1. Create a Supabase project. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
2. In Supabase → **Authentication → Providers → Google**, paste your Google OAuth
   **client ID** and **client secret** (the secret lives here on the server — never in this repo).
3. In Google Cloud Console, add `https://<project-ref>.supabase.co/auth/v1/callback`
   as an **Authorized redirect URI**, and enable the **Google Calendar API**.
4. Copy `.env.example` → `.env` and fill in:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_GOOGLE_CLIENT_ID=...     # public client id only
   ```

> ⚠️ The `client_secret_*.json` you downloaded from Google is **gitignored** on purpose.
> Copy its values into the Supabase dashboard, then keep the file out of source control.

## How it works
- **localStorage is the source of truth.** Every write bumps `cat_meta.last_updated`.
- When logged in, the full data blob syncs to Supabase every 60 min, on tab hide, and
  when the connection returns — reconciled by **last-write-wins** on `last_updated`.
- Planner reminders become real Google Calendar events when logged in; otherwise you get
  copy-paste reminder text.

See the architecture doc for the full data model and flows.
