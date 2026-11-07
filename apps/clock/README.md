# Clock

Configurable work/rest interval timer with rounds, pause/resume, and reset.

**Technical focus:** Timers, input validation, lifecycle cleanup.

[Original Expo Snack](https://snack.expo.dev/@siddv19/clockvadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- clock
npm start -- clock
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

A browser preview is available with npm start -- clock --web after setup.

## Verification

- ios: export passed (2026-11-07T02:51:44.848Z)
- android: export passed (2026-11-07T02:51:53.362Z)
- web: export passed (2026-11-07T02:58:56.541Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Set work/rest periods to one second and rounds to one.
- Start; verify work, rest, and completion.
- Test pause/resume and reset during a longer interval.
