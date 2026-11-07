[← Portfolio](../../README.md) · [Original Snack](https://snack.expo.dev/@siddv19/personal-project) · [Source notes](SOURCE.md)

# Stock Watcher (prototype)

**Prototype · Expo SDK 54 · iOS / Android / Web**

> **Prototype status:** historical-chart failures use simulated data. News and company-profile views contain placeholders, and dark mode is unfinished.

Stock dashboard prototype with live quote/metric requests, chart UI, a simulated chart fallback, and placeholder news/company sections.

## What it demonstrates

- Configured quote and metric requests feed a stock-dashboard interface.
- The chart interface includes a simulated-data fallback when historical data is unavailable.
- News/company sections contain placeholders; dark mode is unfinished.

## Run locally

From the repository root:

```bash
npm run setup -- stock-watcher
npm start -- stock-watcher
```

Use Node.js 22.13+ and an Expo runtime that supports SDK 54. You can also run <code>npm ci</code> and <code>npm start</code> directly in this project folder.

For a browser preview:

```bash
npm start -- stock-watcher --web
```

### API setup

Follow the [development proxy guide](../../services/api-proxy/README.md), configure provider credentials in the proxy's local environment file, and set this app's <code>EXPO_PUBLIC_API_BASE_URL</code>. Use the development computer's LAN address when testing from a phone.

## Implementation note

This React Native prototype is separate from the Python/PyTorch AI Stock Market Predictor listed as in progress on the résumé.

## Validation

| Target | Recorded result |
| --- | --- |
| iOS | JS / asset export passed |
| Android | JS / asset export passed |
| Web | JS / asset export passed |

An export verifies JavaScript and asset bundling. It is separate from a native binary build, a physical-device test, or a live-provider test. See the [validation record](../../verification/README.md) for scope and timestamps.

### Functional checklist

- Start the API proxy with your Finnhub key.
- Request a quote and open a stock chart.
- Test unsupported symbols, unavailable chart data, and a network error.
