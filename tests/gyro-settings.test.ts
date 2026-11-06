import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { DEFAULT_GYRO_OPTIONS, migrateLegacyGyroOptions, migratePreviousGyroOptions, normalizeGyroOptions } from '../src/game/systems/gyroSettings.ts';
test('invalid saved settings safely fall back and sensitivity is bounded', () => {
  assert.deepEqual(normalizeGyroOptions(null), DEFAULT_GYRO_OPTIONS);
  assert.deepEqual(normalizeGyroOptions({sensitivity: Infinity, invertX:'yes'}), DEFAULT_GYRO_OPTIONS);
  assert.equal(normalizeGyroOptions({sensitivity: 50, invertX:true}).sensitivity, 3);
  assert.equal(normalizeGyroOptions({sensitivity: -1}).sensitivity, 0.5);
  assert.equal(normalizeGyroOptions({invertX:true}).invertX, true);
});

test('migrates old settings once with requested baseline and preserved axis direction', () => {
  assert.deepEqual(migrateLegacyGyroOptions({sensitivity: 1.5, invertX: true, invertY: false}), {sensitivity: 1.3, invertX: true, invertY: false, horizontalAxis: 'turn'});
  assert.equal(normalizeGyroOptions({sensitivity: 1.5}).sensitivity, 1.5);
});

test('saved horizontal axis is validated', () => {
  assert.equal(normalizeGyroOptions({horizontalAxis:'turn'}).horizontalAxis, 'turn');
  assert.equal(normalizeGyroOptions({horizontalAxis:'unknown'}).horizontalAxis, 'turn');
});

test('existing options migrate to turn without losing calibration', () => {
  assert.deepEqual(migratePreviousGyroOptions({sensitivity: 1.3, invertX: true, invertY: false, horizontalAxis: 'roll'}), {sensitivity: 1.3, invertX: true, invertY: false, horizontalAxis: 'turn'});
  assert.equal(normalizeGyroOptions({horizontalAxis:'roll'}).horizontalAxis, 'roll');
});

test('calibration survives normalization and rejects unreasonable stored values', () => {
  const valid = {x:0.01, y:-0.02, z:0.005, deadZone:0.012};
  assert.deepEqual(normalizeGyroOptions({calibration:valid}).calibration, valid);
  assert.equal(normalizeGyroOptions({calibration:{...valid, deadZone:1}}).calibration, undefined);
  assert.equal(normalizeGyroOptions({calibration:{...valid, x:100}}).calibration, undefined);
});
