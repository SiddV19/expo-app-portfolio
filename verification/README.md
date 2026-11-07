# Verification record

| App | iOS export | Android export | Web export |
| --- | --- | --- | --- |
| Which Am I | Pass | Pass | Pass |
| Lightsaber | Pass | Pass | Native device app |
| TiltGame (Star Rush) | Pass | Pass | Native device app |
| PainterStarter | Pass | Pass | Pass |
| RouteMapper | Pass | Pass | Native device app |
| GlobalGuesser | Pass | Pass | Native device app |
| MemoryApp | Pass | Pass | Pass |
| Clock | Pass | Pass | Pass |
| Times Tables | Pass | Pass | Pass |
| Calculator | Pass | Pass | Pass |
| Weather App | Pass | Pass | Pass |
| Stock Watcher (prototype) | Pass | Pass | Pass |
| Clock — collaborative suite | Pass | Pass | Pass |

## What an export verifies

Metro resolves the reachable JavaScript, dependencies, and local assets into a platform bundle. This catches missing assets, unsupported imports, and syntax/dependency failures. It does not compile/sign a native binary, certify runtime UI behavior, validate an external API subscription, or exercise hardware sensors.

Detailed export timestamps are in results.json. Re-run one app with npm run verify:exports -- calculator; install its dependencies first.

## Source-preview checks

Source Snack preview interactions are recorded in browser-checks.json as they are completed. They test the saved app behavior; the GitHub package additionally receives local export validation after packaging changes.

## Physical-device checks

Use the functional checklist in every app README. Motion apps need a physical accelerometer, haptics, and audio checks. Map apps need a native map provider and foreground GPS checks. Data apps need provider credentials configured in the development proxy. No paid EAS builds or simulator sessions are represented by these checks.
