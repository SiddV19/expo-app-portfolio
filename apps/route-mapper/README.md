[← Portfolio](../../README.md) · [Original Snack](https://snack.expo.dev/@siddv19/routemapperarigovadali) · [Source notes](SOURCE.md)

# RouteMapper

**Application · Expo SDK 54 · iOS / Android**

GPS run tracker with saved routes, distance and pace calculations, elevation statistics, summaries, and route details.

## What it demonstrates

- Foreground GPS updates draw a recorded path and feed distance, time, and pace calculations.
- Run summaries include elevation information and route statistics.
- Named routes are stored locally and can be reopened in a detail view.

## Run locally

From the repository root:

```bash
npm run setup -- route-mapper
npm start -- route-mapper
```

Use Node.js 22.13+ and an Expo runtime that supports SDK 54. You can also run <code>npm ci</code> and <code>npm start</code> directly in this project folder.

This app uses native device capabilities. Run it on a matching iOS/Android runtime; physical motion, maps, audio, and haptics should be checked on a suitable device.

## Implementation note

This is the complete RouteMapperArigoVadali collaborative implementation. Its source name and provenance are retained in SOURCE.md; the incomplete earlier save is documented in the inventory.

## Validation

| Target | Recorded result |
| --- | --- |
| iOS | JS / asset export passed |
| Android | JS / asset export passed |

An export verifies JavaScript and asset bundling. It is separate from a native binary build, a physical-device test, or a live-provider test. See the [validation record](../../verification/README.md) for scope and timestamps.

### Functional checklist

- Grant foreground location access on a physical device.
- Start a run and move; check the path, distance, elapsed time, and pace.
- Stop and verify saved data can be read.
