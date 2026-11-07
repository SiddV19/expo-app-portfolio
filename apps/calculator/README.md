[← Portfolio](../../README.md) · [Original Snack](https://snack.expo.dev/@siddv19/calculatorappvadali) · [Source notes](SOURCE.md)

# Calculator

**Application · Expo SDK 54 · iOS / Android / Web**

Scientific-style calculator with arithmetic, parentheses, powers, square roots, logarithms, and error handling.

## What it demonstrates

- Arithmetic, parentheses, and powers support expression-based calculations.
- Square root, logarithm, sign, percentage, and decimal controls extend the keypad.
- Formatting and error handling provide feedback for invalid calculations.

## Run locally

From the repository root:

```bash
npm run setup -- calculator
npm start -- calculator
```

Use Node.js 22.13+ and an Expo runtime that supports SDK 54. You can also run <code>npm ci</code> and <code>npm start</code> directly in this project folder.

For a browser preview:

```bash
npm start -- calculator --web
```

## Validation

| Target | Recorded result |
| --- | --- |
| iOS | JS / asset export passed |
| Android | JS / asset export passed |
| Web | JS / asset export passed |

An export verifies JavaScript and asset bundling. It is separate from a native binary build, a physical-device test, or a live-provider test. See the [validation record](../../verification/README.md) for scope and timestamps.

### Functional checklist

- Enter 7 + 3 = and verify 10.
- Check square root, logarithm, parentheses, and clear.
- Check division by zero and invalid expressions produce an error.
