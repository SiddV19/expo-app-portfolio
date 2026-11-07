[← Portfolio](../../README.md) · [Original Snack](https://snack.expo.dev/@siddv19/clockappprakashagnihotrivadali) · [Source notes](SOURCE.md)

# Clock — collaborative suite

**Collaborative variant · Expo SDK 54 · iOS / Android / Web**

Tabbed timer collection with an interval timer, countdown, and stopwatch.

## What it demonstrates

- A tabbed interface groups an interval timer, countdown, and stopwatch.
- Separate screen modules organize the three timing experiences.
- The collaborative source name and attribution are retained with the project.

## Run locally

From the repository root:

```bash
npm run setup -- clock-suite
npm start -- clock-suite
```

Use Node.js 22.13+ and an Expo runtime that supports SDK 54. You can also run <code>npm ci</code> and <code>npm start</code> directly in this project folder.

For a browser preview:

```bash
npm start -- clock-suite --web
```

## Implementation note

This is the ClockappPrakashAgnihotriVadali collaborative variant. It is retained as a variant, with its original source name and attribution.

## Validation

| Target | Recorded result |
| --- | --- |
| iOS | JS / asset export passed |
| Android | JS / asset export passed |
| Web | JS / asset export passed |

An export verifies JavaScript and asset bundling. It is separate from a native binary build, a physical-device test, or a live-provider test. See the [validation record](../../verification/README.md) for scope and timestamps.

### Functional checklist

- Open each of the three timer tabs.
- Start/pause/reset the interval timer, countdown, and stopwatch.
- Switch tabs during a timer and check the intended running behavior.
