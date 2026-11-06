# 3D pass — lightweight revision, 30 October 2026

Rendered directly from `buildWorld` and `buildWaste` using Three.js r180 at 420×650, DPR 1.5. These are model previews, not captures of the native Expo UI. Shared camera, hemisphere/key lighting, ACES tone mapping; no real-time shadows, postprocessing, or textures. Native device FPS has not been measured by the agent.

| Scene | Preview triangles before → after reduction | Preview render calls after | Geometries |
|---|---:|---:|---:|
| Park | 17,678 → 7,688 | 12 | 9 |
| School | 18,162 → 8,440 | 21 | 15 |
| Beach | 15,698 → 7,080 | 15 | 11 |
| Community | 18,222 → 8,354 | 21 | 15 |

The preview includes waste and aim rings. Native gameplay additionally has invisible low-poly target spheres and a hidden picking hull. Static scenery is three material batches; waste models are one batch each. Native rendering uses Lambert materials, one directional light and a hemisphere light. Aim classification runs at up to 30 Hz while visual rotation follows the render loop. The picking hull has fewer than 450 triangles and avoids raycasting the visual scenery.

The dense first iteration caused lag reported by the user. This revision roughly halves geometry, halves tree count, reduces flowers/rocks/path segments, removes extra water glints and fill lighting, and replaces Standard materials with Lambert materials. It retains each stage's main landmark and all 15 waste silhouettes. All items have regression checks for finite geometry, initial visibility, and centre-reticle acquisition within the real gyro pitch limit.

Remaining difference from the reference: intentionally simplified mobile low-poly detail, no cinematic shadows or dense foliage. This is the user's requested lighter direction. Reload on the physical device to verify frame pacing and thermal behaviour; browser renderer counts are not native FPS evidence.
