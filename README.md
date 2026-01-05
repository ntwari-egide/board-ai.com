# Board AI Frontend

Board AI is a multi-agent debate experience. This frontend (Next.js + TypeScript) connects to the Board AI API, lets users start debates with specialized personas, stream responses live, review analytics, and manage attachments.

## What you get

- Ready-to-ship Next.js 13 app with TypeScript
- Tailwind CSS with theme tokens for Board AI styling
- Ant Design component kit where needed
- API client and hooks for conversations, personas, messages, and uploads
- WebSocket client for live debate streams
- Auth flows for email/password and social providers
- SEO (OG tags, sitemap) and sensible defaults for production

## Tech stack

- Next.js 13, React 18, TypeScript
- Tailwind CSS, Ant Design
- State and data: React Query, Zustand store (see `src/store`)
- Testing: Jest + Testing Library
- Tooling: ESLint, Prettier, Husky, lint-staged

## Prerequisites

- Node 18+ and pnpm (preferred) or yarn
- Board AI API running locally or reachable remotely
- Environment file based on `env.example`

## Setup

```bash
pnpm install
cp env.example .env.local
# edit .env.local with API base URL, WebSocket URL, auth keys
```

## Run locally

```bash
pnpm dev
```

Open http://localhost:3000.

## Build and start

```bash
pnpm build
pnpm start
```

## Environment variables

Key vars you must set in `.env.local`:

- `NEXT_PUBLIC_API_BASE_URL` (REST base, e.g., http://localhost:3000/api)
- `NEXT_PUBLIC_WS_URL` (WebSocket base, e.g., ws://localhost:3000/board)
- `NEXT_PUBLIC_APP_URL` (site URL for OG tags)
- Auth provider keys/secrets as needed

## Useful scripts

- `pnpm lint` — lint with ESLint
- `pnpm test` — unit tests
- `pnpm dev` — local dev
- `pnpm build` — production build
- `pnpm start` — run built app

## Project structure (high level)

- `src/pages` — Next.js pages and routes
- `src/components` — UI components
- `src/features` — conversation flows, persona UI, analytics views
- `src/services` — API clients and WebSocket helpers
- `src/store` — client state
- `src/styles` — Tailwind config and globals

## Connecting to the API

Set `NEXT_PUBLIC_API_BASE_URL` to your API (defaults to localhost). WebSockets use `NEXT_PUBLIC_WS_URL` on the `/board` namespace. Auth headers are handled in the API client; ensure your tokens are available in the browser (http-only cookies or local storage depending on your setup).

## Deployment notes

- For Vercel or Railway, use the same env vars as above.
- Ensure the API is reachable from the deployed frontend (CORS allowed, correct domain).
- Use `pnpm build` as the build command; `pnpm start` or the platform default Next.js runtime for serving.

## Testing and quality

- Run `pnpm test` before pushing.
- Run `pnpm lint` to keep code style consistent.

## Support

If something breaks, capture steps to reproduce, browser/OS, and any network or console errors, then open an issue.
