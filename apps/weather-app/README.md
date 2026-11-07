# Weather App

Coordinate-based weather lookup with current conditions and a multi-day forecast.

**Technical focus:** REST APIs, forecast aggregation, loading/error states.

[Original Expo Snack](https://snack.expo.dev/@siddv19/weatherappvadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- weather-app
npm start -- weather-app
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

A browser preview is available with npm start -- weather-app --web after setup.

## Live data

Follow [API proxy setup](../../services/api-proxy/README.md). Provider keys stay on the server. Copy this app’s .env.example to .env.local and set EXPO_PUBLIC_API_BASE_URL to the proxy address. A physical phone needs the development computer’s LAN address rather than localhost.

## Verification

- ios: export passed (2026-11-07T02:53:11.330Z)
- android: export passed (2026-11-07T02:53:23.421Z)
- web: export passed (2026-11-07T02:59:41.027Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Start the API proxy with your OpenWeather key.
- Look up valid coordinates and inspect current and daily conditions.
- Check invalid coordinates and a failed network request.
