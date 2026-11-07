[← Portfolio](../../README.md) · [Original Snack](https://snack.expo.dev/@siddv19/lightsabervadali) · [Source notes](SOURCE.md)

# Lightsaber

**Application · Expo SDK 55 · iOS / Android**

Phone-motion lightsaber simulation with orientation-aware controls, sound effects, and haptics.

## What it demonstrates

- Orientation-aware controls use accelerometer input to gate the on/off state.
- Motion thresholds trigger swing and crash sounds, with cooldowns and haptic feedback.
- Portrait orientation and sensor-listener cleanup support the native interaction.

## Run locally

From the repository root:

```bash
npm run setup -- lightsaber
npm start -- lightsaber
```

Use Node.js 22.13+ and an Expo runtime that supports SDK 55. You can also run <code>npm ci</code> and <code>npm start</code> directly in this project folder.

This app uses native device capabilities. Run it on a matching iOS/Android runtime; physical motion, maps, audio, and haptics should be checked on a suitable device.

## Validation

| Target | Recorded result |
| --- | --- |
| iOS | JS / asset export passed |
| Android | JS / asset export passed |

An export verifies JavaScript and asset bundling. It is separate from a native binary build, a physical-device test, or a live-provider test. See the [validation record](../../verification/README.md) for scope and timestamps.

### Functional checklist

- Use a physical iPhone or Android device with the matching Expo runtime.
- Hold upright to turn on; flip the phone to turn off.
- Check on/off, swing, and crash sounds, haptics, and portrait lock.
