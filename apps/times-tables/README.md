# Times Tables

Multiplication practice app with numeric answer entry and a review of incorrect questions.

**Technical focus:** Question generation, scoring, navigation.

[Original Expo Snack](https://snack.expo.dev/@siddv19/timestablesvadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- times-tables
npm start -- times-tables
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

A browser preview is available with npm start -- times-tables --web after setup.

## Verification

- ios: export passed (2026-11-07T02:52:03.668Z)
- android: export passed (2026-11-07T02:52:13.246Z)
- web: export passed (2026-11-07T02:59:05.739Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Choose a multiplication set and start practice.
- Submit one correct and one incorrect answer.
- Finish and inspect the incorrect-answer review.
