# MemoryApp

Car-logo matching game with shuffled cards, progress tracking, and stored high scores.

**Technical focus:** Randomization, game state, persistent storage.

[Original Expo Snack](https://snack.expo.dev/@siddv19/memoryappvadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- memory-app
npm start -- memory-app
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

A browser preview is available with npm start -- memory-app --web after setup.

## Verification

- ios: export passed (2026-11-07T02:51:24.745Z)
- android: export passed (2026-11-07T02:51:36.512Z)
- web: export passed (2026-11-07T02:58:47.901Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Start a game and flip two cards.
- Verify matches remain visible and mismatches turn over.
- Complete a board and verify the stored high score.
