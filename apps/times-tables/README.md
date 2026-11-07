[← Portfolio](../../README.md) · [Original Snack](https://snack.expo.dev/@siddv19/timestablesvadali) · [Source notes](SOURCE.md)

# Times Tables

**Application · Expo SDK 54 · iOS / Android / Web**

Multiplication practice app with numeric answer entry and a review of incorrect questions.

## What it demonstrates

- A setup flow leads into multiplication questions and numeric answer entry.
- Answer handling tracks progress through the practice session.
- An incorrect-answer review screen closes the learning loop.

## Run locally

From the repository root:

```bash
npm run setup -- times-tables
npm start -- times-tables
```

Use Node.js 22.13+ and an Expo runtime that supports SDK 54. You can also run <code>npm ci</code> and <code>npm start</code> directly in this project folder.

For a browser preview:

```bash
npm start -- times-tables --web
```

## Validation

| Target | Recorded result |
| --- | --- |
| iOS | JS / asset export passed |
| Android | JS / asset export passed |
| Web | JS / asset export passed |

An export verifies JavaScript and asset bundling. It is separate from a native binary build, a physical-device test, or a live-provider test. See the [validation record](../../verification/README.md) for scope and timestamps.

### Functional checklist

- Choose a multiplication set and start practice.
- Submit one correct and one incorrect answer.
- Finish and inspect the incorrect-answer review.
