[← Portfolio](../../README.md) · [Original Snack](https://snack.expo.dev/@siddv19/memoryappvadali) · [Source notes](SOURCE.md)

# MemoryApp

**Application · Expo SDK 54 · iOS / Android / Web**

Car-logo matching game with shuffled cards, progress tracking, and stored high scores.

## What it demonstrates

- Shuffled car-logo pairs create a different matching board.
- Flip, mismatch, and match state drive the card interactions and move counter.
- A stored best score connects game completion with local persistence.

## Run locally

From the repository root:

```bash
npm run setup -- memory-app
npm start -- memory-app
```

Use Node.js 22.13+ and an Expo runtime that supports SDK 54. You can also run <code>npm ci</code> and <code>npm start</code> directly in this project folder.

For a browser preview:

```bash
npm start -- memory-app --web
```

## Validation

| Target | Recorded result |
| --- | --- |
| iOS | JS / asset export passed |
| Android | JS / asset export passed |
| Web | JS / asset export passed |

An export verifies JavaScript and asset bundling. It is separate from a native binary build, a physical-device test, or a live-provider test. See the [validation record](../../verification/README.md) for scope and timestamps.

### Functional checklist

- Start a game and flip two cards.
- Verify matches remain visible and mismatches turn over.
- Complete a board and verify the stored high score.
