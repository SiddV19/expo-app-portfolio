[← Portfolio](../../README.md) · [Original Snack](https://snack.expo.dev/@siddv19/globalguesservadali) · [Source notes](SOURCE.md)

# GlobalGuesser

**Application · Expo SDK 54 · iOS / Android**

Photo-based location guessing game with map markers, distance-based scores, and saved results.

## What it demonstrates

- A photo prompt and map marker form the location-guessing interaction.
- Haversine distance connects each guess to a distance-based score.
- Round progression and local storage retain results across the game flow.

## Run locally

From the repository root:

```bash
npm run setup -- global-guesser
npm start -- global-guesser
```

Use Node.js 22.13+ and an Expo runtime that supports SDK 54. You can also run <code>npm ci</code> and <code>npm start</code> directly in this project folder.

This app uses native device capabilities. Run it on a matching iOS/Android runtime; physical motion, maps, audio, and haptics should be checked on a suitable device.

## Implementation note

The saved photo set contains US landmarks; the original project name is retained.

## Validation

| Target | Recorded result |
| --- | --- |
| iOS | JS / asset export passed |
| Android | JS / asset export passed |

An export verifies JavaScript and asset bundling. It is separate from a native binary build, a physical-device test, or a live-provider test. See the [validation record](../../verification/README.md) for scope and timestamps.

### Functional checklist

- Open a round, inspect the photo, and place a map marker.
- Submit a guess and verify distance-based scoring.
- Finish the game and check the saved result after reopening.
