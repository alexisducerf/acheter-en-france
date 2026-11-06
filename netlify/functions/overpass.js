// Proxy for the Overpass API.
// overpass-api.de rejects anonymous requests (HTTP 406) and asks clients to identify
// themselves; browsers can't set a User-Agent, so queries go through this function.
// Tried in order; the next one is used when a server is unreachable, overloaded or times out.
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
const TIMEOUT_MS = 25_000;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);
const USER_AGENT = 'acheter-en-france/1.0 (+https://github.com/NideXTC/acheter-en-france)';

// Successful responses are kept in memory while the function instance stays warm,
// so repeated searches for the same commune don't hit Overpass again.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 100;
const cache = new Map(); // query → { body, expires }

const getCached = (query) => {
  const entry = cache.get(query);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    cache.delete(query);
    return null;
  }
  return entry.body;
};

const setCached = (query, body) => {
  if (cache.size >= CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value); // drop the oldest
  cache.set(query, { body, expires: Date.now() + CACHE_TTL_MS });
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }

  let query;
  try {
    ({ query } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }
  if (typeof query !== 'string' || !query.trim()) {
    return json(400, { error: 'Missing "query"' });
  }

  const cached = getCached(query);
  if (cached) return json(200, cached);

  let lastError = 'aucun serveur Overpass joignable';
  for (const url of OVERPASS_URLS) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      const text = await response.text();
      if (response.ok) {
        setCached(query, text);
        return json(200, text);
      }

      console.error(`Overpass ${url} → ${response.status}:`, text.slice(0, 300));
      lastError = `${new URL(url).host} a répondu ${response.status}`;
      if (!RETRYABLE_STATUSES.has(response.status)) {
        return json(response.status, { error: lastError });
      }
    } catch (error) {
      const reason = error.cause?.code || error.name || error.message;
      console.error(`Overpass ${url} injoignable:`, reason);
      lastError = `${new URL(url).host} injoignable (${reason})`;
    }
  }
  return json(502, { error: lastError });
};
