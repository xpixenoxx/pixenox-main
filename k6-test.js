import http from 'k6/http';
import { check, sleep } from 'k6';

// Read target URL from environment variable, default to localhost for local testing
const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    realistic_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },  // Ramp up to 100 users
        { duration: '1m', target: 100 },   // Warm up
        { duration: '1m', target: 500 },   // Spike to 500 users
        { duration: '5m', target: 500 },   // 5-minute sustained load stage
        { duration: '1m', target: 0 },     // Ramp down to 0
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // Less than 1% of requests can fail
    http_req_duration: ['p(95)<1000', 'p(99)<2500'], // p95 under 1s, p99 under 2.5s
  },
};

export default function () {
  // 1. User visits homepage
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'homepage loaded': (r) => r.status === 200,
  });

  // User reads the homepage for 2-5 seconds
  sleep(Math.random() * 3 + 2);

  // 2. User navigates to services
  const servicesRes = http.get(`${BASE_URL}/services`);
  check(servicesRes, {
    'services loaded': (r) => r.status === 200,
  });

  // User browses services for 1-3 seconds
  sleep(Math.random() * 2 + 1);

  // 3. User navigates to contact page
  const contactRes = http.get(`${BASE_URL}/contact`);
  check(contactRes, {
    'contact loaded': (r) => r.status === 200,
  });

  // User fills out contact form (simulation pause)
  sleep(Math.random() * 5 + 3);
}
