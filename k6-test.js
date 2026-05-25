import http from "k6/http";
import { check, group, sleep, fail } from "k6";

// BASE_URL is required. Defaults to localhost if not set.
// The URL must be reachable BEFORE running. See README-k6.md for usage.
const BASE_URL = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

export const options = {
  scenarios: {
    realistic_load: {
      executor: "ramping-vus",
      stages: [
        { duration: "1m", target: 100 },
        { duration: "2m", target: 100 },
        { duration: "2m", target: 500 },
        { duration: "3m", target: 500 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{route:home}": ["p(95)<1000", "p(99)<2500"],
    "http_req_duration{route:services}": ["p(95)<1000", "p(99)<2500"],
    "http_req_duration{route:contact}": ["p(95)<1000", "p(99)<2500"],
  },
};

/**
 * setup() runs once before all VUs start.
 * Validates BASE_URL is reachable and fails fast with a clear error if not.
 */
export function setup() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  k6 Public Route Test — Pixenox`);
  console.log(`  Target BASE_URL: ${BASE_URL}`);
  console.log(`${'='.repeat(60)}\n`);

  const res = http.get(`${BASE_URL}/`, { timeout: '10s', tags: { route: 'setup_check' } });

  if (res.error_code !== 0) {
    let reason = '';
    if (res.error && res.error.includes('no such host')) {
      reason =
        `  → DNS resolution failed: "${BASE_URL}" does not exist or is not deployed.\n` +
        `  → If using a Vercel URL, confirm the deployment has completed.\n` +
        `  → If local, confirm "npm run start" is running on port 3000.`;
    } else if (res.error && res.error.includes('connection refused')) {
      reason =
        `  → Connection refused: The server is not listening at this address.\n` +
        `  → Confirm "npm run start" is running and the port matches BASE_URL.`;
    } else {
      reason = `  → Error: ${res.error}`;
    }

    fail(
      `\n\n${'!'.repeat(60)}\n` +
      `  SETUP FAILED — Cannot reach BASE_URL\n` +
      `  URL tried: ${BASE_URL}\n` +
      `${reason}\n` +
      `${'!'.repeat(60)}\n` +
      `  FIX: Set BASE_URL to a reachable URL before running:\n` +
      `    k6 run -e BASE_URL=http://localhost:3000 k6-test.js\n` +
      `    k6 run -e BASE_URL=https://your-preview.vercel.app k6-test.js\n` +
      `${'!'.repeat(60)}\n`
    );
  }

  console.log(`  ✓ BASE_URL is reachable (HTTP ${res.status}). Starting test...\n`);
  return { baseUrl: BASE_URL };
}

export default function ({ baseUrl }) {
  group("homepage", function () {
    const res = http.get(`${baseUrl}/`, {
      tags: { route: "home" },
      timeout: "60s",
    });

    check(res, {
      "homepage loaded": (r) => r.status === 200,
    });
  });

  sleep(1);

  group("services", function () {
    const res = http.get(`${baseUrl}/services`, {
      tags: { route: "services" },
      timeout: "60s",
    });

    check(res, {
      "services loaded": (r) => r.status === 200,
    });
  });

  sleep(1);

  group("contact", function () {
    const res = http.get(`${baseUrl}/contact`, {
      tags: { route: "contact" },
      timeout: "60s",
    });

    check(res, {
      "contact loaded": (r) => r.status === 200,
    });
  });

  sleep(Math.random() * 3 + 1);
}
