import http from 'node:http';
import { pathToFileURL } from 'node:url';

const finnhubPaths = new Set(['quote', 'stock/candle', 'stock/metric']);
const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

export function createApiServer({ env = process.env, fetcher = fetch } = {}) {
  return http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' });
      res.end();
      return;
    }
    if (req.method !== 'GET') return send(res, 405, { error: 'Only GET is supported.' });
    const incoming = new URL(req.url, 'http://localhost');
    if (incoming.pathname === '/health') return send(res, 200, { status: 'ok' });
    let upstream;
    let key;
    let keyName;
    if (incoming.pathname.startsWith('/api/finnhub/')) {
      const endpoint = incoming.pathname.slice('/api/finnhub/'.length);
      if (!finnhubPaths.has(endpoint)) return send(res, 404, { error: 'Unknown endpoint.' });
      key = env.FINNHUB_API_KEY;
      keyName = 'token';
      upstream = new URL('https://finnhub.io/api/v1/' + endpoint);
    } else if (incoming.pathname === '/api/weather/forecast') {
      const lat = Number(incoming.searchParams.get('lat'));
      const lon = Number(incoming.searchParams.get('lon'));
      if (!incoming.searchParams.has('lat') || !incoming.searchParams.has('lon') || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        return send(res, 400, { error: 'Enter valid latitude and longitude.' });
      }
      key = env.OPENWEATHER_API_KEY;
      keyName = 'appid';
      upstream = new URL('https://api.openweathermap.org/data/2.5/forecast');
    } else {
      return send(res, 404, { error: 'Unknown endpoint.' });
    }
    if (!key) return send(res, 503, { error: 'Configure the provider API key in services/api-proxy/.env.local.' });
    for (const [name, value] of incoming.searchParams) {
      if (!['token', 'appid', 'apikey', 'api_key'].includes(name.toLowerCase())) upstream.searchParams.append(name, value);
    }
    upstream.searchParams.set(keyName, key);
    try {
      const response = await fetcher(upstream, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) return send(res, 502, { error: 'Data provider returned HTTP ' + response.status + '.' });
      send(res, 200, await response.json());
    } catch {
      send(res, 502, { error: 'The data provider could not be reached. Please retry.' });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 8787);
  const host = process.env.HOST || '127.0.0.1';
  createApiServer().listen(port, host, () => console.log('Development API proxy listening on ' + host + ':' + port));
}
