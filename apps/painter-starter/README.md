# PainterStarter

Touch drawing canvas with freehand paths, geometric shapes, fill, erasing, movement, and undo.

**Technical focus:** Touch gestures, SVG, state management.

[Original Expo Snack](https://snack.expo.dev/@siddv19/painterstartervadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- painter-starter
npm start -- painter-starter
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

A browser preview is available with npm start -- painter-starter --web after setup.

## Verification

- ios: export passed (2026-11-07T02:50:14.232Z)
- android: export passed (2026-11-07T02:50:27.365Z)
- web: export passed (2026-11-07T02:58:39.177Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Draw a freehand path and a filled geometric shape.
- Move a selected shape, erase, undo, and clear.
- Change color and thickness and verify subsequent strokes.
