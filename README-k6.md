# k6 Load Testing — Pixenox

This directory contains two k6 load test files:

| File | Purpose | Max VUs |
|---|---|---|
| `k6-test.js` | Public route performance (/, /services, /contact) | 500 |
| `k6-api-test.js` | API & server-side flows (admin login page, contact API) | 20 |

---

## Prerequisites

1. Install k6: https://grafana.com/docs/k6/latest/set-up/install-k6/
2. Have the app running or deployed.

---

## How to Run

### Local Testing

Start the Next.js production server first, then run k6 in a separate terminal:

```bash
# Terminal 1 — Start the app
npm run build
npm run start

# Terminal 2 — Run public page tests
k6 run k6-test.js
# or explicitly:
k6 run -e BASE_URL=http://localhost:3000 k6-test.js

# Terminal 2 — Run API tests
k6 run k6-api-test.js
# or explicitly:
k6 run -e BASE_URL=http://localhost:3000 k6-api-test.js
```

### Vercel Preview URL Testing

Replace the URL with your actual Vercel preview deployment URL. You can find it in the Vercel dashboard after a branch deployment.

```bash
k6 run -e BASE_URL=https://pixenox-git-my-branch-abc123.vercel.app k6-test.js
k6 run -e BASE_URL=https://pixenox-git-my-branch-abc123.vercel.app k6-api-test.js
```

> **Important:** The URL must be live and fully deployed before running. If the deployment is still building, k6 will fail immediately.

### Production URL Testing

> ⚠️ Run public page tests only against production. API write tests should only target staging/preview environments.

```bash
# Public read tests — safe at full load
k6 run -e BASE_URL=https://pixenox.com k6-test.js

# API tests — run at low VUs against production (already default to 20 VUs)
k6 run -e BASE_URL=https://pixenox.com k6-api-test.js
```

---

## Troubleshooting

### `lookup staging.pixenox.com: no such host`

This is **not an app crash**. It means k6 could not resolve the hostname via DNS.

**This happens when:**
- The domain does not exist (e.g., `staging.pixenox.com` is not configured)
- The Vercel preview URL has expired or was never created
- You are offline or your machine's DNS is not working
- There is a typo in the URL

**Fix:**
1. Open the URL in your browser first. If the browser can't load it, k6 won't either.
2. Use a URL you know is live:
   ```bash
   k6 run -e BASE_URL=http://localhost:3000 k6-test.js
   ```
3. For Vercel, copy the exact preview URL from your Vercel dashboard — do not guess or construct it manually.

### `connection refused`

The host resolved but nothing is listening on that port.

**Fix:** Run `npm run start` before running k6 for local tests.

### `SETUP FAILED — Cannot reach BASE_URL`

Both `k6-test.js` and `k6-api-test.js` include a `setup()` function that hits `BASE_URL/` once before any VUs start. If the host is unreachable, the test aborts immediately with a clear error message instead of running 500 VUs against a dead host.

---

## Thresholds

### Public Routes (`k6-test.js`)
| Threshold | Limit |
|---|---|
| Error rate | < 1% |
| p95 per route | < 1000ms |
| p99 per route | < 2500ms |

### API Routes (`k6-api-test.js`)
| Threshold | Limit |
|---|---|
| Error rate | < 1% |
| p95 read routes | < 1000ms |
| p95 write routes | < 2000ms |
| p99 overall | < 3000ms |

---

## What Is and Is Not Tested

| Flow | Tested | Notes |
|---|---|---|
| `GET /` | ✅ | ISR-cached, safe at 500 VUs |
| `GET /services` | ✅ | ISR-cached, safe at 500 VUs |
| `GET /contact` | ✅ | ISR-cached, safe at 500 VUs |
| `GET /admin/login` | ✅ (read only) | Page load only, not auth submission |
| `POST /api/contact` | ✅ (rate-limit path) | Uses static IP → hits 429 safely |
| `POST /api/contact` (actual inserts) | ⚠️ Staging only | Randomize IP only on staging DB |
| Supabase Auth (signIn) | ❌ | Supabase platform rate-limits auth heavily; avoid load testing |
| Admin dashboard reads | ❌ | Requires valid session cookie injection |
| Any destructive admin write | ❌ | Never load test destructive operations |

---

## Current Performance Baseline (as of last run)

| Metric | Result |
|---|---|
| Max VUs | 500 |
| Total requests | 81,531 |
| Throughput | 158 req/s |
| Error rate | 0.00% |
| Overall p95 | 748ms ✅ |
| Max latency | 1.4s ✅ |
| `/ ` p95 / p99 | 750ms / 1.03s ✅ |
| `/services` p95 / p99 | 744ms / 1.04s ✅ |
| `/contact` p95 / p99 | 752ms / 1.02s ✅ |
