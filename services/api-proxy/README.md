# Development API proxy

Weather App and the Stock Watcher prototype use this small Node.js server so provider credentials are not committed or bundled into a mobile app.

## Start

From this folder, copy .env.example to .env.local and enter your own Finnhub and/or OpenWeather provider key. From the repository root:

```bash
npm run proxy
```

No npm dependencies are needed for this server. Node.js 22.13+ loads the environment file and supplies fetch.

For a web preview on this computer, the apps default to http://localhost:8787. For a physical phone on the same Wi-Fi, set HOST=0.0.0.0 in the proxy environment file, and copy the relevant app’s .env.example to .env.local. Set EXPO_PUBLIC_API_BASE_URL to http://YOUR_COMPUTER_LAN_IP:8787. Restart the app after changing configuration.

## Routes

| Route | Upstream |
| --- | --- |
| GET /health | Local health check |
| GET /api/weather/forecast?lat=...&lon=...&units=imperial | OpenWeather forecast |
| GET /api/finnhub/quote?symbol=... | Finnhub quote |
| GET /api/finnhub/stock/candle?... | Finnhub historical candles |
| GET /api/finnhub/stock/metric?symbol=...&metric=all | Finnhub metrics |

The endpoint list is fixed. Client-supplied provider keys are discarded and the server injects its configured key. Provider errors are returned without credential-bearing URLs. Missing credentials produce a clear setup error.

This is a local development service. A publicly deployed proxy needs authentication, quotas, and production hosting configuration before it is shared as a live API.

## Verify

Run npm test from the repository root. The tests cover missing credentials, endpoint allowlisting, server-only key injection, coordinate validation, and error redaction; they do not contact live providers.
