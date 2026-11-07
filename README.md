# Siddharth Vadali — React Native Application Portfolio

A collection of mobile applications built with React Native, Expo, and JavaScript/JSX during 2025–2026. The projects explore sensors, GPS and maps, persistent storage, timers, scoring, audio, haptics, input validation, SVG drawing, and REST APIs.

This repository contains **12 apps and 1 retained Clock variant**, recovered from the saved siddv19 Expo Snacks. Each app has its own dependencies, lockfile, assets, setup instructions, and original-source link.

## Start an app

Install Node.js 22.13 or newer. From this repository’s root:

```bash
npm run setup -- calculator
npm start -- calculator
```

For a supported browser preview, add --web to the start command. Run npm start with no app ID to see the available choices. Each app installs independently so the saved Expo SDK 54 and 55 projects do not share incompatible native dependencies.

For iOS/Android, use an Expo Go version that supports the app’s SDK or a matching development build. Lightsaber uses SDK 55; the other exports use SDK 54. Native motion and mapping features require a suitable device/runtime.

## Apps

| App | What it does | Source |
| --- | --- | --- |
| [Which Am I](apps/which-am-i) | Weighted ten-question car recommendation quiz with multiple screens and result images. | [Snack](https://snack.expo.dev/@siddv19/whichamivadali) |
| [Lightsaber](apps/lightsaber) | Phone-motion lightsaber simulation with orientation-aware controls, sound effects, and haptics. | [Snack](https://snack.expo.dev/@siddv19/lightsabervadali) |
| [TiltGame (Star Rush)](apps/tilt-game) | Tilt-controlled arcade game: catch stars, avoid bombs, and collect hearts as the pace increases. | [Snack](https://snack.expo.dev/@siddv19/tiltgamevadali) |
| [PainterStarter](apps/painter-starter) | Touch drawing canvas with freehand paths, geometric shapes, fill, erasing, movement, and undo. | [Snack](https://snack.expo.dev/@siddv19/painterstartervadali) |
| [RouteMapper](apps/route-mapper) | GPS run tracker with saved routes, distance and pace calculations, elevation statistics, summaries, and route details. | [Snack](https://snack.expo.dev/@siddv19/routemapperarigovadali) |
| [GlobalGuesser](apps/global-guesser) | Photo-based location guessing game with map markers, distance-based scores, and saved results. | [Snack](https://snack.expo.dev/@siddv19/globalguesservadali) |
| [MemoryApp](apps/memory-app) | Car-logo matching game with shuffled cards, progress tracking, and stored high scores. | [Snack](https://snack.expo.dev/@siddv19/memoryappvadali) |
| [Clock](apps/clock) | Configurable work/rest interval timer with rounds, pause/resume, and reset. | [Snack](https://snack.expo.dev/@siddv19/clockvadali) |
| [Times Tables](apps/times-tables) | Multiplication practice app with numeric answer entry and a review of incorrect questions. | [Snack](https://snack.expo.dev/@siddv19/timestablesvadali) |
| [Calculator](apps/calculator) | Scientific-style calculator with arithmetic, parentheses, powers, square roots, logarithms, and error handling. | [Snack](https://snack.expo.dev/@siddv19/calculatorappvadali) |
| [Weather App](apps/weather-app) | Coordinate-based weather lookup with current conditions and a multi-day forecast. | [Snack](https://snack.expo.dev/@siddv19/weatherappvadali) |
| [Stock Watcher](apps/stock-watcher) | Stock-market dashboard with quotes, charts, company details, news, watchlist, and screening views. | [Snack](https://snack.expo.dev/@siddv19/personal-project) |

## Retained variants

| Variant | Scope |
| --- | --- |
| [Clock — collaborative suite](apps/clock-suite) | Tabbed timer collection with an interval timer, countdown, and stopwatch. |

The original collaborative names and source links are recorded in each variant. Drafts, starter exercises, and earlier copies are listed in the [Snack inventory](docs/SNACK_INVENTORY.md) rather than presented as extra products.

## Live API apps

Weather App and Stock Watcher use a small [development API proxy](services/api-proxy). Provider keys belong in the proxy’s local environment file. The Expo apps receive only the proxy URL. The original embedded provider keys are not included.

## Validation

```bash
npm run validate
npm test
npm run setup -- which-am-i
npm run verify:exports -- which-am-i
```

Current result: **13 of 13 app folders have passed both iOS and Android JavaScript/asset exports**. 35 platform exports have passed in total. See the [verification record](verification/README.md) for exact scope and remaining device checks.

An export is not a native build or a physical-device test. Individual READMEs state what was checked and which sensor, GPS, audio, or live-data checks remain.

## Portfolio and résumé consistency

- [Project name mapping](docs/RESUME_MAPPING.md)
- [LinkedIn and résumé project copy](docs/PROFILE_TEXT.md)
- [Packaging changes](docs/MAINTENANCE.md)
- [Original Snack inventory](docs/SNACK_INVENTORY.md)

The React Native Stock Watcher is separate from the Python/PyTorch AI Stock Market Predictor listed as in progress on the résumé.

