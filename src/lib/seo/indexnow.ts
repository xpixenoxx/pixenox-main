export const INDEXNOW_KEY = '8f3c2a91e4b74d60a1c5e8f2b9d47a13';

const CANONICAL_HOST = 'www.pixenox.com';
const CANONICAL_BASE = `https://${CANONICAL_HOST}`;

export const CORE_INDEXNOW_URLS = [
  `${CANONICAL_BASE}/`,
  `${CANONICAL_BASE}/engineering`,
  `${CANONICAL_BASE}/engineering/ai-systems`,
  `${CANONICAL_BASE}/engineering/ai-visibility`,
  `${CANONICAL_BASE}/engineering/enterprise-intelligence-engineering`,
  `${CANONICAL_BASE}/products/engenox`,
  `${CANONICAL_BASE}/tools/ai-visibility-checker`,
  `${CANONICAL_BASE}/research/ai-visibility-benchmark-2026`,
  `${CANONICAL_BASE}/compare/ai-visibility-platforms`,
  `${CANONICAL_BASE}/glossary`,
  `${CANONICAL_BASE}/work`,
  `${CANONICAL_BASE}/blog`,
  `${CANONICAL_BASE}/company`,
  `${CANONICAL_BASE}/faqs`,
];

export interface IndexNowResult {
  ok: boolean;
  status: number;
  submitted: number;
  error?: string;
}

/** Submits canonical Pixenox URLs to the shared IndexNow endpoint (Bing, ChatGPT Search, Yandex). */
export async function submitIndexNow(urls: string[]): Promise<IndexNowResult> {
  const cleanUrls = Array.from(
    new Set(
      urls
        .map((u) => (u.startsWith('http') ? u : `${CANONICAL_BASE}${u.startsWith('/') ? '' : '/'}${u}`))
        .filter((u) => u.startsWith(`${CANONICAL_BASE}/`))
    )
  ).slice(0, 500);

  if (cleanUrls.length === 0) {
    return { ok: false, status: 400, submitted: 0, error: 'No valid canonical URLs to submit' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: CANONICAL_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${CANONICAL_BASE}/${INDEXNOW_KEY}.txt`,
        urlList: cleanUrls,
      }),
      signal: controller.signal,
    });

    return {
      ok: res.ok || res.status === 202,
      status: res.status,
      submitted: cleanUrls.length,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      submitted: cleanUrls.length,
      error: err instanceof Error ? err.message : 'IndexNow request failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}
