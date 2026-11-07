# Calculator

Scientific-style calculator with arithmetic, parentheses, powers, square roots, logarithms, and error handling.

**Technical focus:** Expression handling, numerical operations, validation.

[Original Expo Snack](https://snack.expo.dev/@siddv19/calculatorappvadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- calculator
npm start -- calculator
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

A browser preview is available with npm start -- calculator --web after setup.

## Verification

- ios: export passed (2026-11-07T02:52:36.996Z)
- android: export passed (2026-11-07T02:52:58.394Z)
- web: export passed (2026-11-07T02:59:26.012Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Enter 7 + 3 = and verify 10.
- Check square root, logarithm, parentheses, and clear.
- Check division by zero and invalid expressions produce an error.
