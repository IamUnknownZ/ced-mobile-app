# Planet Cleaner

Planet Cleaner is a mobile game about caring for the environment and learning how to sort waste. Rotate a small 3D planet using your device's gyroscope, aim at litter, collect it, and choose the appropriate waste category. Each answer includes an explanation and disposal advice.

The game has four areas to explore: the public park, school, beach, and community. It includes 15 types of waste, a discoverable waste guide, scores and level results, sound settings, and gyroscope calibration. Progress and settings are saved on the device.

## Getting started

Install Node.js 24 and the project dependencies, then start Expo:

```sh
npm install
npx expo start --tunnel --clear
```

Scan the QR code with **Expo Go compatible with Expo SDK 58**, or use an SDK 58 development build. A physical device with a gyroscope is required to test motion controls. If Expo Go reports a version mismatch, see [Expo's troubleshooting guide](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

## How to play

1. Choose a location and move your device to rotate the planet.
2. Aim the crosshair at waste, then tap anywhere on the planet to inspect it.
3. Collect the item and choose a waste category.
4. Read the explanation and continue until the area is clean.

Use **Pause rotation** to adjust your grip, **Recenter** to reset the view, and the fast exploration setting to rotate further with less physical movement. Test buttons are available when a gyroscope is unavailable; they do not replace testing the sensor on a real device.

## Motion settings

Open **Motion settings** to adjust sensitivity, horizontal aiming, axis direction, and the centre position. To calibrate the device, place it still for about four seconds while the game measures sensor drift and noise. The resulting calibration is saved on the device. Test the controls and adjust sensitivity to suit your device and preference.

## Checks

```sh
npm run typecheck
npm test
npx expo install --check
npx expo export --platform android
```

An export verifies that the bundle can be built; it does not replace testing gameplay, rendering, and motion controls on physical devices.

Additional project information is in the `docs/` directory, including asset credits in `docs/ASSET_LICENSES.md`, educational sources in `docs/CONTENT_SOURCES.md`, and device testing notes in `docs/DEVICE_TEST.md`.
