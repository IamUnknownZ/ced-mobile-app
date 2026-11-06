# Planet Cleaner — design context

A Thai-language portrait game for casual players learning to sort waste. The 11 reference images in `reference_images/` are the visual authority: miniature garden planets, sky blue, leafy green, warm orange actions, rounded friendly controls and clear, generously spaced Thai text. Use real interactive UI and 3D, not a screenshot of a reference.

## Runtime direction

The current Alpha shell uses React Native system typefaces with bold headings and legible body text, safe-area spacing, large labelled touch targets, and a shared set of styles in `src/screens/AlphaScreens.tsx`. Its blue sky `#d9f2ff`, leaf green `#176b50`, orange `#e97c1e`, white cards `#ffffff`, and dark text `#173f50` come from the reference audit. The home screen uses a standalone 2D miniature-planet illustration in `assets/art/menu-planet.png`; gameplay continues to render its actual 3D scene. This is an initial mobile token source, to be consolidated with gameplay UI as it matures.

## Behavior and verification

Tutorial, guide, settings and one playable park are reachable from the menu. Show only discovered entries in the guide, present local disposal caveats, never reveal an answer before sorting, and retain a non-gyro diagnostic path. The final visual comparison and safe-area, text scaling, and interaction checks require real phones and tablets; no device screenshots are claimed by the Alpha shell.


## Shared controls

`src/components/GameButton.tsx` owns primary, secondary and compact button styling across the home, tutorial, guide, settings and game dialogs. Warm orange signals starting a mission, leaf green signals continuing, sky blue is navigation, and pale outlined controls are secondary gameplay/settings actions. Raised lower edges, a bright rim, pressed and disabled states, Thai text and at least 44-point targets follow the supplied game references. Category choices, stage cards, switches and the full-scene aim interaction retain purpose-specific shapes.
