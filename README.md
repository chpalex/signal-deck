# Signal Deck (Secure)

This version proxies all CaptionKit API calls through Vercel serverless
functions so the API key never reaches the browser.

## Setup

1. In Vercel project settings > Environment Variables, add:
   Key:   CAPTIONKIT_API_KEY
   Value: your CaptionKit key (e.g. ck_...)
   Environment: Production (and Preview/Development if you test there too)

2. Deploy this whole folder (drag-and-drop on vercel.com/new, or `vercel` CLI,
   or connect via GitHub). Vercel auto-detects the `api/` folder as
   serverless functions - no extra config needed.

## Files
- index.html         - the app, calls /api/signal and /api/status
- api/signal.js       - proxies POST requests to CaptionKit's /v2/signal
- api/status.js       - proxies GET requests to CaptionKit's /v2/me/status
- vercel.json         - minimal config

## Important
Because this now includes serverless functions, you can no longer just
drag a single HTML file onto Vercel - you must upload/deploy this entire
folder (or connect the repo) so the api/ functions deploy alongside it.
