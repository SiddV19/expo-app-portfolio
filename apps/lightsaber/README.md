# Lightsaber

Phone-motion lightsaber simulation with orientation-aware controls, sound effects, and haptics.

**Technical focus:** Accelerometer, audio, haptics, orientation.

[Original Expo Snack](https://snack.expo.dev/@siddv19/lightsabervadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- lightsaber
npm start -- lightsaber
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 55. Use a runtime that supports this SDK.

This app needs native device APIs. Use the matching Expo Go/runtime or a development build on iOS/Android; the web preview is not a substitute for its hardware features.

## Verification

- ios: export passed (2026-11-07T02:56:37.611Z)
- android: export passed (2026-11-07T02:56:47.484Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Use a physical iPhone or Android device with the matching Expo runtime.
- Hold upright to turn on; flip the phone to turn off.
- Check on/off, swing, and crash sounds, haptics, and portrait lock.
