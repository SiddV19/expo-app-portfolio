# Stock Watcher (prototype)

Stock dashboard prototype with live quote/metric requests, chart UI, a simulated chart fallback, and placeholder news/company sections.

**Technical focus:** REST APIs, SVG charts, asynchronous state.

[Original Expo Snack](https://snack.expo.dev/@siddv19/personal-project) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- stock-watcher
npm start -- stock-watcher
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

A browser preview is available with npm start -- stock-watcher --web after setup.

## Live data

Follow [API proxy setup](../../services/api-proxy/README.md). Provider keys stay on the server. Copy this app’s .env.example to .env.local and set EXPO_PUBLIC_API_BASE_URL to the proxy address. A physical phone needs the development computer’s LAN address rather than localhost.

**Status: Prototype.** Historical-chart failures use simulated data. News and company-profile sections contain placeholders, and dark mode is unfinished. These features are not presented as completed live-data functionality.

This React Native application is separate from the Python/PyTorch AI Stock Market Predictor marked “In Progress” on the résumé. Live quotes and historical data require provider access. Screening and estimate displays are application features, not validated investment predictions.

## Verification

- ios: export passed (2026-11-07T02:53:33.515Z)
- android: export passed (2026-11-07T02:53:42.856Z)
- web: export passed (2026-11-07T02:59:49.723Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Start the API proxy with your Finnhub key.
- Request a quote and open a stock chart.
- Test unsupported symbols, unavailable chart data, and a network error.
