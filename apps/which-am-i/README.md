[← Portfolio](../../README.md) · [Original Snack](https://snack.expo.dev/@siddv19/whichamivadali) · [Source notes](SOURCE.md)

# Which Am I

**Application · Expo SDK 54 · iOS / Android / Web**

Weighted ten-question car recommendation quiz with multiple screens and result images.

## What it demonstrates

- A ten-question flow combines multiple-choice input with a passenger-count slider.
- Weighted answers produce an Eco, Sport, Utility, or Luxury car recommendation.
- Result images and a restart flow connect input validation, scoring, and navigation.

## Run locally

From the repository root:

```bash
npm run setup -- which-am-i
npm start -- which-am-i
```

Use Node.js 22.13+ and an Expo runtime that supports SDK 54. You can also run <code>npm ci</code> and <code>npm start</code> directly in this project folder.

For a browser preview:

```bash
npm start -- which-am-i --web
```

## Validation

| Target | Recorded result |
| --- | --- |
| iOS | JS / asset export passed |
| Android | JS / asset export passed |
| Web | JS / asset export passed |

An export verifies JavaScript and asset bundling. It is separate from a native binary build, a physical-device test, or a live-provider test. See the [validation record](../../verification/README.md) for scope and timestamps.

### Functional checklist

- Complete all ten questions and open the result screen.
- Select a different set of answers; verify the result can change.
- Restart the quiz and verify answers reset.
