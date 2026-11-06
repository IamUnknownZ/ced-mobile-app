import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { guardOptionalContextLoss } from '../src/game/scene/contextCleanup.ts';
test('keeps context loss when supported and skips it only when unavailable', () => {
  let calls = 0;
  const original = () => { calls++; };
  const supported = { getContext: () => ({getExtension: () => ({})}), forceContextLoss: original };
  guardOptionalContextLoss(supported);
  assert.equal(supported.forceContextLoss, original);
  supported.forceContextLoss();
  const unsupported = { getContext: () => ({getExtension: () => null}), forceContextLoss: original };
  guardOptionalContextLoss(unsupported);
  unsupported.forceContextLoss();
  assert.equal(calls, 1);
});
