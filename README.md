# Signal Deck

A secure, mobile-friendly control surface for [CaptionKit](https://captionkit.com), built for real-time operation during live events. It was designed for church production teams who need to start and stop live captions on cue — for example, turning captions off during a worship song and back on for the sermon — without exposing API credentials to the browser or requiring a laptop at the sound booth.

Signal Deck runs as a lightweight web app that can be opened on a phone, tablet, or desktop, added to an iOS home screen like a native app, and controlled by anyone on the team without needing developer access to CaptionKit itself.

## Features

- **One-tap caption control** — start, stop, and manage live captions during a service without touching the CaptionKit dashboard
- **Secure API proxying** — your CaptionKit API key lives only on the server (Vercel), never in the browser
- **Login-protected access** — a cookie-based login screen keeps the control surface private, with reliable behavior on iOS Safari and home-screen web apps
- **Mobile-first design** — a slim top bar and bottom tab navigation replace desktop sidebar clutter on phones and tablets
- **Configurable playback link** — set your own CaptionKit playback/embed URL directly in the app; it's saved locally and persists across sessions
- **Live status indicator** — see at a glance whether captions are currently live or offline

## How It Works

Signal Deck is a static front end (`index.html`) paired with a small set of Vercel serverless functions and edge middleware. The browser never talks to CaptionKit directly — every request is routed through your own Vercel deployment, which attaches your API key server-side before forwarding it on.
Browser → /api/signal, /api/status → CaptionKit API
Browser → middleware.js (checks login cookie) → index.html
Browser → /api/login → sets signed session cookie

## Prerequisites

- A [CaptionKit](https://captionkit.com) account and API key
- A [Vercel](https://vercel.com) account (the free tier is sufficient)
- A GitHub repository containing this project (recommended, so Vercel can auto-deploy on every push)

## Setup

### 1. Deploy the project to Vercel

Connect this repository to a new Vercel project (Vercel → Add New → Project → Import Git Repository), or deploy the folder directly with the Vercel CLI. Vercel automatically detects the `api/` folder as serverless functions and `middleware.js` as edge middleware — no build configuration is required.

### 2. Configure environment variables

In your Vercel project, go to **Settings → Environment Variables** and add the following. Apply each one to Production, and to Preview/Development if you plan to test there too.

| Variable | Description |
|---|---|
| `CAPTIONKIT_API_KEY` | Your CaptionKit API key (e.g. `ck_...`). Used server-side by the `/api/signal` and `/api/status` functions to authenticate with CaptionKit. This key is never sent to or visible in the browser. |
| `SITE_USERNAME` | The username required to log in to your Signal Deck control surface. Choose something only your team knows. |
| `SITE_PASSWORD` | The password required to log in alongside `SITE_USERNAME`. Choose a strong, unique password — this is what stands between the public internet and your CaptionKit controls. |
| `AUTH_SECRET` | A long, random secret string used to cryptographically sign the login session cookie, preventing it from being forged or tampered with. Generate one with the command below — do not reuse a secret from another project. |

To generate a strong `AUTH_SECRET`, run this in a terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

All four variables are required. If any are missing, the affected feature (API calls or login) will return a server configuration error instead of working silently.

### 3. Deploy

Push to your connected GitHub repository, or run `vercel --prod` from the project folder. Vercel will build and deploy automatically. Because this project includes serverless functions and middleware, you must deploy the **entire folder** — dragging a single HTML file onto Vercel is not sufficient.

## Using Signal Deck

1. Open your deployed Vercel URL on any device.
2. Log in with the `SITE_USERNAME` and `SITE_PASSWORD` you configured. The session persists for 14 days via a secure cookie, so your team won't need to log in every service.
3. On first use, go to the Watch/Playback section and enter your CaptionKit playback URL, then save it — this is stored in that browser and will be remembered next time.
4. Use the Controls section to start and stop captions in real time as the service runs (e.g. stop during music, start again for spoken segments).
5. On iOS, add the page to your home screen (Share → Add to Home Screen) for one-tap access that behaves like a native app.

## How Login Works

Visiting the site without a valid session redirects to `login.html`. Submitting the login form posts credentials to `/api/login`, which checks them against `SITE_USERNAME` and `SITE_PASSWORD`. On success, it issues a signed, `HttpOnly` cookie valid for 14 days. `middleware.js` checks this cookie on every request and redirects back to the login page if it's missing, invalid, or expired.

This cookie-based approach was chosen deliberately over HTTP Basic Auth, which is unreliable on iOS Safari and frequently breaks when a page is added to the home screen as a standalone web app.

## Mobile Behavior

On screens narrower than 860px, the full desktop sidebar is hidden. In its place, a slim top strip shows only the app name, a live/offline status badge, and a light/dark theme toggle, while a bottom tab bar handles navigation between sections — matching the conventions of a native iOS app rather than a scaled-down desktop layout.

## Playback URL

The CaptionKit embed link shown in the Watch/Playback section is not hardcoded. Enter your own CaptionKit playback URL in the app and click Save; it's stored in the browser's `localStorage` and persists across reloads and future sessions on that device. No redeploy or environment variable change is needed to update it, and each device/browser keeps its own saved link independently.

## Project Structure
.
├── index.html           The control surface UI, calls /api/signal and /api/status
├── login.html           Login page shown to unauthenticated visitors
├── middleware.js        Edge middleware, guards all routes behind a valid login cookie
├── vercel.json          Minimal Vercel configuration
└── api/
    ├── signal.js        Proxies POST requests to CaptionKit's /v2/signal endpoint
    ├── status.js        Proxies GET requests to CaptionKit's /v2/me/status endpoint
    └── login.js         Verifies login credentials and issues the signed session cookie

## Security Notes

- Your CaptionKit API key never reaches the browser — all CaptionKit requests are proxied server-side.
- Access to the entire app is gated behind a login screen backed by a signed, `HttpOnly` cookie, so the session token can't be read or altered by client-side scripts.
- Rotate `SITE_PASSWORD` and `AUTH_SECRET` periodically, and immediately if you suspect either has been exposed. Rotating `AUTH_SECRET` will invalidate all existing login sessions, requiring everyone to log in again.

## Troubleshooting

- **"Server not configured" error** — one or more required environment variables is missing in Vercel; double-check all four are set for the correct environment.
- **Stuck on the login page after correct credentials** — confirm `AUTH_SECRET` is set and hasn't changed recently, and that cookies aren't being blocked by the browser.
- **Playback embed not loading** — verify the URL entered in the Watch/Playback section is a valid, publicly accessible CaptionKit link.
Copy this directly into your README.md file, then commit and push it to GitHub.
