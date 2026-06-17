# URL Redirect Analyzer

A full-stack dashboard for checking a URL's redirect chain, final destination, timing, and domain metadata. It supports normal HTTP redirect behavior for VP Link, LinkPays, and generic short-link providers without bypassing authentication, browser gates, or third-party access controls.

## Project Structure

```text
url-redirect-analyzer/
  client/
    src/
      api/
      components/
      utils/
      App.jsx
      main.jsx
      index.css
    public/
    Dockerfile
    nginx.conf
    package.json
    tailwind.config.js
    vite.config.js
    .env.example
  server/
    src/
      config/
      middleware/
      models/
      routes/
      services/
      utils/
      app.js
      server.js
    Dockerfile
    package.json
    .env.example
  docker-compose.yml
  package.json
  README.md
```

## Features

- URL validation on the client and server
- `POST /api/analyze` endpoint that follows redirects safely
- Redirect timeline with status codes, response time, final URL, and domain info
- MongoDB-backed history for authenticated users
- Basic email/password auth with JWT
- Rate limiting, Helmet headers, CORS allow-listing, input sanitization, and SSRF protection
- Blocks localhost, private IPs, link-local, multicast, reserved, and other non-public network targets
- Provider detection for VP Link and LinkPays-style links when the hostname matches those patterns

## Backend API

### Analyze URL

```http
POST /api/analyze
Content-Type: application/json
Authorization: Bearer <token> (optional)

{
  "url": "https://example.com/short"
}
```

Response:

```json
{
  "data": {
    "originalUrl": "https://example.com/short",
    "finalUrl": "https://destination.example/path",
    "finalStatusCode": 200,
    "redirectCount": 2,
    "responseTimeMs": 423,
    "chain": [
      {
        "hop": 0,
        "url": "https://example.com/short",
        "statusCode": 301,
        "statusText": "Moved Permanently",
        "redirectTo": "https://example.com/next",
        "durationMs": 112,
        "domain": {}
      }
    ],
    "domainInfo": {}
  }
}
```

### Auth and History

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/history`
- `DELETE /api/history`

`/api/analyze` works for guests. If a valid bearer token is sent, the analysis is stored in MongoDB.

## Database Schema

### User

- `name`: display name
- `email`: unique lowercase email
- `passwordHash`: bcrypt password hash
- `createdAt`, `updatedAt`

### SearchHistory

- `user`: MongoDB reference to `User`
- `originalUrl`
- `finalUrl`
- `finalStatusCode`
- `redirectCount`
- `responseTimeMs`
- `provider`
- `chain`: redirect steps with URL, status, duration, domain, and redirect target
- `domainInfo`: original/final domain metadata
- `createdAt`, `updatedAt`

## Environment Variables

Backend: copy `server/.env.example` to `server/.env`.

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/url_redirect_analyzer
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-at-least-32-random-characters
JWT_EXPIRES_IN=7d
MAX_REDIRECTS=10
REQUEST_TIMEOUT_MS=8000
ANALYZE_WINDOW_MS=900000
ANALYZE_MAX_REQUESTS=30
AUTH_WINDOW_MS=900000
AUTH_MAX_REQUESTS=12
```

Frontend: copy `client/.env.example` to `client/.env`.

```env
VITE_API_URL=http://localhost:4000
```

## Setup

1. Install Node.js 20+ and MongoDB, or use Docker.
2. Install dependencies:

```bash
npm run install:all
```

3. Configure environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Start MongoDB locally, then run the app:

```bash
npm run dev
```

5. Open the frontend:

```text
http://localhost:5173
```

The API runs on:

```text
http://localhost:4000
```

## Docker Setup

Create `server/.env`, then run:

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

## Deployment Guide

### Backend

1. Deploy `server/` to a Node host such as Render, Railway, Fly.io, AWS ECS, or a VPS.
2. Set production environment variables:
   - `NODE_ENV=production`
   - `MONGO_URI=<MongoDB Atlas or managed Mongo connection string>`
   - `CLIENT_ORIGIN=https://your-frontend-domain.com`
   - `JWT_SECRET=<strong random secret>`
3. Keep the API behind HTTPS.
4. Keep rate limiting enabled and set proxy trust correctly if your platform terminates TLS upstream.

### Database

1. Use MongoDB Atlas or a private MongoDB instance.
2. Restrict network access to the backend deployment.
3. Create backups for production history data.

### Frontend

1. Set `VITE_API_URL=https://your-api-domain.com`.
2. Run:

```bash
npm run build --prefix client
```

3. Deploy `client/dist` to Vercel, Netlify, Cloudflare Pages, Nginx, or any static host.

### Production Notes

- The analyzer follows HTTP redirects and safe HTML/browser-visible redirect headers only; it does not bypass login pages, anti-abuse systems, countdown pages, or third-party access controls.
- If VP Link or LinkPays returns an interstitial page instead of an HTTP 3xx response, the app reports that page as the final reachable destination.
- Keep `MAX_REDIRECTS` and `REQUEST_TIMEOUT_MS` conservative to reduce abuse risk.
