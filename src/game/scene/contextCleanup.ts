/** R3F disposes its renderer normally; context loss is optional on native GL. */
export function guardOptionalContextLoss(renderer: {
  getContext: () => { getExtension: (name: string) => unknown };
  forceContextLoss: () => void;
}): void {
  // On contexts without the extension Three.js cannot force a loss anyway.
  // Avoid asking Three.js for it during teardown, which would emit a warning.
  if (!renderer.getContext().getExtension('WEBGL_lose_context')) {
    renderer.forceContextLoss = () => {};
  }
}
