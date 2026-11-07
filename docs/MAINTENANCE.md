# Packaging changes

The UI, game rules, quiz data, calculations, and local media were recovered from saved Expo Snacks. The repository preparation made these practical changes:

- Added independent npm project names, setup commands, lockfiles, provenance links, and documentation.
- Removed unused starter modules and unused scratch files. In particular, an unused AssetExample component referred to a missing snack-icon image in the quiz export.
- Replaced the quiz’s prerelease RNEUI slider dependency with Expo-compatible @react-native-community/slider while retaining its answer range and scoring.
- Kept each saved Expo SDK major rather than upgrading the collection wholesale.
- Removed embedded provider credentials. Weather and stock requests now go through a small local proxy; provider keys stay in its local environment file.
- Fixed the Lightsaber accelerometer subscription cleanup to retain the current subscription in a ref.
- Added readable app names/slugs and foreground location permission text for RouteMapper.

The incomplete earlier RouteMapper save was excluded. The complete later collaborative version is packaged under the résumé name RouteMapper.

Exact package resolutions are recorded in each app’s package-lock.json. Export results and physical-device checks are recorded separately in verification/ and the app READMEs.
