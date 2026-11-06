import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { categories, parkItems } from '../src/data/park.ts';
test('park items have unique ids, valid categories and educational text', () => {
  assert.equal(new Set(parkItems.map(item => item.id)).size, parkItems.length);
  assert.equal(new Set(categories.map(category => category.id)).size, 4);
  assert.equal(new Set(parkItems.map(item => item.categoryId)).size, 4);
  for (const item of parkItems) {
    assert.ok(categories.some(category => category.id === item.categoryId));
    assert.ok(item.nameTh && item.explanationTh && item.disposalTipTh && item.modelKey);
  }
});
