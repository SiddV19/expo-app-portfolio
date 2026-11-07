# TiltGame (Star Rush)

Tilt-controlled arcade game: catch stars, avoid bombs, and collect hearts as the pace increases.

**Technical focus:** Sensors, game loop, collision detection, haptics.

[Original Expo Snack](https://snack.expo.dev/@siddv19/tiltgamevadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- tilt-game
npm start -- tilt-game
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

This app needs native device APIs. Use the matching Expo Go/runtime or a development build on iOS/Android; the web preview is not a substitute for its hardware features.

The high score in this saved version lasts for the current app session.

## Verification

- ios: export passed (2026-11-07T02:49:53.408Z)
- android: export passed (2026-11-07T02:50:03.074Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Start on a physical phone and tilt left/right.
- Catch a star, a heart, and a bomb; verify points and lives.
- Finish a game, replay, and verify the session high score.
