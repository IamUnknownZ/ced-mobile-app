import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { calibrateGyro, correctGyro, integrateGyro, initialOrientation } from '../src/game/systems/gyro.ts';
const samples = Array.from({length: 101}, (_, i) => ({timestamp:i * .02, x:.012, y:-.02, z:.006}));
test('stationary calibration removes measured bias and bounds the dead zone', () => {
  const calibration = calibrateGyro(samples); assert.ok(calibration);
  const corrected = correctGyro(samples[1], calibration);
  assert.ok(Math.abs(corrected.y) < 1e-9);
  assert.ok(calibration.deadZone >= .008 && calibration.deadZone <= .06);
  assert.deepEqual(integrateGyro(initialOrientation, correctGyro(samples[0], calibration), corrected, {sensitivity:1.3, invertX:false, invertY:false, horizontalAxis:'turn', calibration}), initialOrientation);
});
test('calibration rejects movement and insufficient samples', () => {
  assert.equal(calibrateGyro(samples.slice(0, 5)), null);
  assert.equal(calibrateGyro(samples.map((s,i)=>({...s,y:i%2 ? 0.5 : -0.5}))), null);
  assert.equal(calibrateGyro(samples.map(s=>({...s,y:0.3}))), null);
});
test('calibrates stationary devices with slower sensor rates and rejects duplicate timestamps', () => {
  const slow = Array.from({length: 12}, (_, i) => ({timestamp:i * .2, x:.012, y:-.02, z:.006}));
  assert.ok(calibrateGyro(slow));
  assert.equal(calibrateGyro(slow.map(s => ({...s, timestamp:0}))), null);
  assert.equal(calibrateGyro(slow.map((s,i) => i===7 ? {...s,timestamp:0} : s)), null);
});
