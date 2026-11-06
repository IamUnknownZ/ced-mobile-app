import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { integrateGyro, initialOrientation, smoothGyro } from '../src/game/systems/gyro.ts';
const options = { sensitivity: 1, invertX: false, invertY: false, horizontalAxis: 'roll' };
const sample = (timestamp: number, x = 0, z = 0, y = 0) => ({ timestamp, x, y, z });
test('integrates angular velocity over time and supports axis inversion', () => {
  const result = integrateGyro(initialOrientation, sample(1), sample(1.1, 2, 1), options);
  assert.ok(Math.abs(result.yaw - .1) < 1e-9);
  assert.ok(Math.abs(result.pitch - .2) < 1e-9);
  assert.ok(integrateGyro(initialOrientation, sample(1), sample(1.1, 2, 1), { ...options, invertX: true }).yaw < 0);
});
test('ignores first, stale, reversed and invalid samples', () => {
  for (const previous of [null, sample(0), sample(2)]) assert.deepEqual(integrateGyro(initialOrientation, previous, sample(1, 1, 1), options), initialOrientation);
  assert.deepEqual(integrateGyro(initialOrientation, sample(1), sample(1.1, NaN, 1), options), initialOrientation);
});
test('limits pitch and ignores minor noise', () => {
  assert.equal(integrateGyro(initialOrientation, sample(1), sample(1.1, .01, .01), options).yaw, 0);
  assert.ok(integrateGyro(initialOrientation, sample(1), sample(1.2, 100, 0), options).pitch <= Math.PI / 3);
});

test('filter smooths abrupt movement and resets after a pause', () => {
  const before = sample(1, 0, 0);
  const after = sample(1.02, 1, 0);
  const filtered = smoothGyro(before, after);
  assert.ok(filtered.x > 0 && filtered.x < 1);
  assert.deepEqual(smoothGyro(before, sample(2, 1, 0)), sample(2, 1, 0));
});

test('portrait horizontal aim follows device roll instead of twisting around its vertical axis', () => {
  const roll = integrateGyro(initialOrientation, sample(1), sample(1.1, 0, 1, 0), options);
  const twist = integrateGyro(initialOrientation, sample(1), sample(1.1, 0, 0, 1), options);
  assert.ok(roll.yaw > 0);
  assert.equal(twist.yaw, 0);
  assert.ok(integrateGyro(initialOrientation, sample(1), sample(1.1, 0, 1), {...options, invertX: true}).yaw < 0);
});

test('both axes respond in both directions and turn mode uses the vertical device axis', () => {
  for (const direction of [-1, 1]) {
    const roll = integrateGyro(initialOrientation, sample(1), sample(1.1, direction, direction), options);
    assert.equal(Math.sign(roll.yaw), direction);
    assert.equal(Math.sign(roll.pitch), direction);
    const turn = integrateGyro(initialOrientation, sample(1), sample(1.1, 0, 0, direction), {...options, horizontalAxis: 'turn'});
    assert.equal(Math.sign(turn.yaw), direction);
  }
});

test('wide-scan amplifies physical turn in both directions and bounds gain', () => {
  for (const direction of [-1, 1]) {
    const turn = sample(1.1, 0, 0, direction);
    const settings = {...options, horizontalAxis: 'turn'};
    const normal = integrateGyro(initialOrientation, sample(1), turn, settings);
    const wide = integrateGyro(initialOrientation, sample(1), turn, settings, 3);
    assert.ok(Math.abs(wide.yaw - normal.yaw * 3) < 1e-9);
    assert.equal(Math.sign(wide.yaw), direction);
    assert.ok(Math.abs(integrateGyro(initialOrientation, sample(1), turn, settings, 10).yaw - wide.yaw) < 1e-9);
  }
});
test('integrates valid slow samples but ignores long interruptions', () => {
  assert.ok(integrateGyro(initialOrientation, sample(1), sample(1.3, 0, 1), options).yaw > 0);
  assert.deepEqual(integrateGyro(initialOrientation, sample(1), sample(1.6, 0, 1), options), initialOrientation);
});
