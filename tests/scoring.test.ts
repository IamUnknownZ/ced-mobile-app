import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { pickupScore, correctScore, wrongScore, completionScore, accuracyPercent } from '../src/game/systems/scoring.ts';
test('scores a pickup, correction, and completion without negative score or repeat penalty', () => {
  assert.equal(pickupScore(0),10);
  assert.equal(wrongScore(10,false),0);
  assert.equal(wrongScore(0,true),0);
  assert.equal(correctScore(0),20);
  assert.equal(completionScore(20),70);
  assert.equal(accuracyPercent(1,2),50);
  assert.equal(accuracyPercent(0,0),0);
});
