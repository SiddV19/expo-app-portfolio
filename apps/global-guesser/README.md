# GlobalGuesser

Photo-based location guessing game with map markers, distance-based scores, and saved results.

**Technical focus:** Maps, Haversine distance, scoring, storage.

[Original Expo Snack](https://snack.expo.dev/@siddv19/globalguesservadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- global-guesser
npm start -- global-guesser
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

This app needs native device APIs. Use the matching Expo Go/runtime or a development build on iOS/Android; the web preview is not a substitute for its hardware features.

The saved photo set contains US landmarks. The app name is preserved from the original project.

## Verification

- ios: export passed (2026-11-07T02:51:02.776Z)
- android: export passed (2026-11-07T02:51:13.032Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Open a round, inspect the photo, and place a map marker.
- Submit a guess and verify distance-based scoring.
- Finish the game and check the saved result after reopening.
