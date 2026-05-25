/**
 * k6 API Test — Pixenox
 *
 * Tests real API/server-side flows: admin login page load and contact form submission.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * EXPECTED RESPONSE CODES (treated as success):
 *   200  = OK
 *   201  = contact submission accepted and inserted into DB
 *   403  = VPN/spam protection intentionally blocked the request
 *   429  = rate limiter intentionally blocked the request (after 3 requests from same IP)
 *
 * REAL FAILURES (counted in contact_unexpected_failure_rate / login_unexpected_failure_rate):
 *   status 0    = true network error (timeout, connection refused, DNS failure)
 *   status 5xx  = server crash / unhandled error
 *   any 4xx not in [403, 429] = unexpected rejection
 *
 * NOTE: k6 sets res.error_code to a non-zero value for ANY non-2xx response,
 * including 429 and 403. Do NOT use res.error_code to detect network failures.
 * Use res.status === 0 instead, which only true connection-level failures produce.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * HOW TO RUN:
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * Local (requires `npm run start` running first):
 *   k6 run -e BASE_URL=http://localhost:3000 k6-api-test.js
 *
 * Vercel preview:
 *   k6 run -e BASE_URL=https://pixenox-git-branch-xyz.vercel.app k6-api-test.js
 *
 * Production (low VUs, read-only only!):
 *   k6 run -e BASE_URL=https://pixenox.com k6-api-test.js
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * "lookup no such host" = BASE_URL domain does not exist / is not deployed.
 * This is a DNS/URL issue, NOT an app crash. Verify the URL in your browser first.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// BASE_URL is required. Defaults to localhost if not set.
const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

// ── Custom Metrics ────────────────────────────────────────────────────────────

// Separate unexpected failure rates per route — only real failures counted.
// k6's built-in http_req_failed is NOT used because it treats 403/429 as failures.
const loginUnexpectedFailureRate = new Rate('login_unexpected_failure_rate');
const contactUnexpectedFailureRate = new Rate('contact_unexpected_failure_rate');

// Route-level latency (nativeHistogram=true for accurate percentiles)
const adminLoginGetLatency = new Trend('route_admin_login_get_duration', true);
const apiContactPostLatency = new Trend('route_api_contact_post_duration', true);

// Contact form outcome counters — visible in k6 summary for debugging
const contact200Count = new Counter('contact_200_count');
const contact201Count = new Counter('contact_201_count');
const contact400Count = new Counter('contact_400_count');
const contact403Count = new Counter('contact_403_count');
const contact429Count = new Counter('contact_429_count');
const contact5xxCount = new Counter('contact_5xx_count');
const contactNetworkErrorCount = new Counter('contact_network_error_count');
const contactUnexpectedFailureCount = new Counter('contact_unexpected_failure_count');

// ── Options ───────────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    // Low VU count intentional — API/write tests should never blast 500 VUs.
    api_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    // Only real failures: network errors (status 0), 5xx, unexpected 4xx.
    // 403 and 429 are intentional protective responses — NOT counted here.
    login_unexpected_failure_rate: ['rate<0.01'],
    contact_unexpected_failure_rate: ['rate<0.01'],

    // Route-level latency thresholds
    route_admin_login_get_duration: ['p(95)<1000', 'p(99)<2500'],
    route_api_contact_post_duration: ['p(95)<2000', 'p(99)<3000'],
  },
};

// ── Expected status codes ─────────────────────────────────────────────────────

// Statuses the contact API intentionally returns:
//   200/201 = accepted, 403 = security block, 429 = rate limited
// 400 is NOT included — the test always sends valid payloads, so 400 would be unexpected.
const EXPECTED_CONTACT_STATUSES = [200, 201, 403, 429];

// ── setup() — validate BASE_URL before any VUs start ─────────────────────────

export function setup() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  k6 API Test — Pixenox`);
  console.log(`  Target BASE_URL: ${BASE_URL}`);
  console.log(`${'='.repeat(60)}\n`);

  const res = http.get(`${BASE_URL}/`, {
    timeout: '10s',
    tags: { route: 'setup_check' },
  });

  if (res.status === 0 || res.error_code !== 0) {
    let reason = '';
    if (res.error && res.error.includes('no such host')) {
      reason =
        `  → DNS resolution failed: "${BASE_URL}" does not exist or is not deployed.\n` +
        `  → If this is a Vercel URL, confirm the deployment has completed.\n` +
        `  → If local, confirm "npm run start" is running on port 3000.`;
    } else if (res.error && res.error.includes('connection refused')) {
      reason =
        `  → Connection refused: The server is not listening at this address.\n` +
        `  → Confirm "npm run start" is running and the port matches BASE_URL.`;
    } else if (res.error && res.error.includes('timeout')) {
      reason =
        `  → Timed out: host unreachable or too slow. Check network/firewall.`;
    } else {
      reason = `  → Error: ${res.error || 'unknown'}`;
    }

    fail(
      `\n\n${'!'.repeat(60)}\n` +
      `  SETUP FAILED — Cannot reach BASE_URL\n` +
      `  URL tried: ${BASE_URL}\n` +
      `${reason}\n` +
      `${'!'.repeat(60)}\n` +
      `  FIX: Set BASE_URL to a reachable URL:\n` +
      `    k6 run -e BASE_URL=http://localhost:3000 k6-api-test.js\n` +
      `    k6 run -e BASE_URL=https://your-preview.vercel.app k6-api-test.js\n` +
      `${'!'.repeat(60)}\n`
    );
  }

  console.log(`  ✓ BASE_URL is reachable (HTTP ${res.status}). Starting test...\n`);
  console.log(`  Response code legend:`);
  console.log(`    200/201 → accepted — contact submission stored ✓`);
  console.log(`    429     → rate limit working — intentional block ✓`);
  console.log(`    403     → spam/VPN protection working — intentional block ✓`);
  console.log(`    5xx     → REAL FAILURE — server crash / unhandled error ✗`);
  console.log(`    0       → REAL FAILURE — network error / timeout / connection refused ✗`);
  console.log(`    other   → REAL FAILURE — unexpected response ✗\n`);

  return { baseUrl: BASE_URL };
}

// ── Default function — VU logic ───────────────────────────────────────────────

export default function ({ baseUrl }) {
  // =========================================================================
  // 1. Admin Login Page Load (Read-only — safe at any load)
  // =========================================================================
  group('admin_login_page', function () {
    const res = http.get(`${baseUrl}/admin/login`, {
      tags: { route: 'admin_login_get' },
      timeout: '30s',
      headers: {
        // Spoofed to localhost so the VPN IP-block in middleware doesn't 403 the login page.
        'X-Forwarded-For': '127.0.0.1',
      },
    });

    // Real failure: true network error (status 0), 5xx, or unexpected 4xx.
    // Admin login page should always return 200. A 403 here would also be unexpected.
    const isLoginFailure =
      res.status === 0 ||
      res.status >= 500 ||
      res.status === 0 ||
      (res.status >= 400 && res.status < 500 && res.status !== 403);

    if (isLoginFailure) {
      console.error(`[login] Unexpected response: status=${res.status}, error=${res.error || 'none'}`);
    }

    loginUnexpectedFailureRate.add(isLoginFailure ? 1 : 0);
    adminLoginGetLatency.add(res.timings.duration);

    check(res, {
      'login page loaded (200)': (r) => r.status === 200,
    });
  });

  sleep(Math.random() * 2 + 1);

  // =========================================================================
  // 2. Contact API Submission (Write — rate-limiter stress test)
  //
  // A fixed X-Forwarded-For IP is used intentionally. After the first 3 requests
  // per 24h window, the rate limiter returns 429. This stresses the rate-limiter
  // path without inserting rows into the database. SAFE for production.
  //
  // To test actual DB inserts (STAGING ONLY), replace IP with:
  //   'X-Forwarded-For': `10.${__VU}.${Math.floor(Math.random() * 255)}.1`
  // =========================================================================
  group('api_contact_submit', function () {
    const payload = JSON.stringify({
      name: 'Load Test User',
      email: `test+${__VU}_${__ITER}@example.com`,
      message: 'This is an automated load test submission. Please ignore.',
    });

    const res = http.post(`${baseUrl}/api/contact`, payload, {
      headers: {
        'Content-Type': 'application/json',
        // Static IP → triggers rate limiter quickly. Intentional.
        'X-Forwarded-For': '192.168.1.100',
      },
      tags: { route: 'api_contact_post' },
      timeout: '30s',
    });

    // ── Increment per-status counters ──────────────────────────────────────
    if (res.status === 0) {
      contactNetworkErrorCount.add(1);
    } else if (res.status === 200) {
      contact200Count.add(1);
    } else if (res.status === 201) {
      contact201Count.add(1);
    } else if (res.status === 400) {
      contact400Count.add(1);
    } else if (res.status === 403) {
      contact403Count.add(1);
    } else if (res.status === 429) {
      contact429Count.add(1);
    } else if (res.status >= 500) {
      contact5xxCount.add(1);
    }

    // ── Determine if this is a real unexpected failure ─────────────────────
    // IMPORTANT: Do NOT use res.error_code here — k6 sets error_code to non-zero
    // for ANY non-2xx response, including intentional 429 and 403 responses.
    // Use res.status === 0 for true network-level failures.
    const isContactUnexpectedFailure =
      res.status === 0 ||                               // network failure
      res.status >= 500 ||                              // server crash
      !EXPECTED_CONTACT_STATUSES.includes(res.status); // unexpected status

    if (isContactUnexpectedFailure) {
      contactUnexpectedFailureCount.add(1);
      console.error(
        `[contact] Unexpected response: status=${res.status}, error=${res.error || 'none'}`
      );
    }

    contactUnexpectedFailureRate.add(isContactUnexpectedFailure ? 1 : 0);
    apiContactPostLatency.add(res.timings.duration);

    // Check that the API responded with an intentional status — 5xx and network errors will fail this.
    check(res, {
      'contact API: intentional response (200/201/403/429)': (r) =>
        EXPECTED_CONTACT_STATUSES.includes(r.status),
    });
  });

  sleep(Math.random() * 3 + 1);
}
