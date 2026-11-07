# RouteMapper

GPS run tracker with saved routes, distance and pace calculations, elevation statistics, summaries, and route details.

**Technical focus:** GPS, maps, geospatial calculations, persistent storage, elevation.

[Original Expo Snack](https://snack.expo.dev/@siddv19/routemapperarigovadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- route-mapper
npm start -- route-mapper
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

This app needs native device APIs. Use the matching Expo Go/runtime or a development build on iOS/Android; the web preview is not a substitute for its hardware features.

## Verification

- ios: export passed (2026-11-07T02:57:53.765Z)
- android: export passed (2026-11-07T02:58:06.072Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Grant foreground location access on a physical device.
- Start a run and move; check the path, distance, elapsed time, and pace.
- Stop and verify saved data can be read.
