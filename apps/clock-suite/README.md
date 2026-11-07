# Clock — collaborative suite

Tabbed timer collection with an interval timer, countdown, and stopwatch.

**Technical focus:** Tab navigation, reusable timer screens.

[Original Expo Snack](https://snack.expo.dev/@siddv19/clockappprakashagnihotrivadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- clock-suite
npm start -- clock-suite
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

A browser preview is available with npm start -- clock-suite --web after setup.

This is the ClockappPrakashAgnihotriVadali collaborative variant. Its original source name is retained for attribution; it is not counted as an additional solo product.

## Verification

- ios: export passed (2026-11-07T03:01:22.644Z)
- android: export passed (2026-11-07T03:01:35.152Z)
- web: export passed (2026-11-07T03:01:44.355Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Open each of the three timer tabs.
- Start/pause/reset the interval timer, countdown, and stopwatch.
- Switch tabs during a timer and check the intended running behavior.
