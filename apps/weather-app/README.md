[← Portfolio](../../README.md) · [Original Snack](https://snack.expo.dev/@siddv19/weatherappvadali) · [Source notes](SOURCE.md)

# Weather App

**Application · Expo SDK 54 · iOS / Android / Web**

Coordinate-based weather lookup with current conditions and a multi-day forecast.

## What it demonstrates

- Latitude and longitude input is validated before requesting a forecast.
- Current and daily forecast views aggregate weather-provider responses.
- Loading and error states handle asynchronous requests through the local API proxy.

## Run locally

From the repository root:

```bash
npm run setup -- weather-app
npm start -- weather-app
```

Use Node.js 22.13+ and an Expo runtime that supports SDK 54. You can also run <code>npm ci</code> and <code>npm start</code> directly in this project folder.

For a browser preview:

```bash
npm start -- weather-app --web
```

### API setup

Follow the [development proxy guide](../../services/api-proxy/README.md), configure provider credentials in the proxy's local environment file, and set this app's <code>EXPO_PUBLIC_API_BASE_URL</code>. Use the development computer's LAN address when testing from a phone.

## Validation

| Target | Recorded result |
| --- | --- |
| iOS | JS / asset export passed |
| Android | JS / asset export passed |
| Web | JS / asset export passed |

An export verifies JavaScript and asset bundling. It is separate from a native binary build, a physical-device test, or a live-provider test. See the [validation record](../../verification/README.md) for scope and timestamps.

### Functional checklist

- Start the API proxy with your OpenWeather key.
- Look up valid coordinates and inspect current and daily conditions.
- Check invalid coordinates and a failed network request.
