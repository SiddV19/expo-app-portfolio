# Which Am I

Weighted ten-question car recommendation quiz with multiple screens and result images.

**Technical focus:** Input validation, weighted scoring, navigation.

[Original Expo Snack](https://snack.expo.dev/@siddv19/whichamivadali) · [Source provenance](SOURCE.md)

## Run

From the repository root:

```bash
npm run setup -- which-am-i
npm start -- which-am-i
```

Or work directly in this folder: npm ci, followed by npm start. Node.js 22.13+ is required. This export uses Expo SDK 54. Use a runtime that supports this SDK.

A browser preview is available with npm start -- which-am-i --web after setup.

## Verification

- ios: export passed (2026-11-07T02:49:01.369Z)
- android: export passed (2026-11-07T02:49:22.785Z)
- web: export passed (2026-11-07T02:58:28.864Z)

An export checks JavaScript and asset bundling. Device sensors, GPS, sound, and live provider access need the checks below; exports do not certify a native store build.

## Functional checks

- Complete all ten questions and open the result screen.
- Select a different set of answers; verify the result can change.
- Restart the quiz and verify answers reset.
