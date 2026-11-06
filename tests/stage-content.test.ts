import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { guideItems, parkItems } from '../src/data/park.ts';
import { stages } from '../src/data/stages.ts';

test('every playable stage has collectible content with learning text', () => {
  const playable = new Map(parkItems.map(item => [item.id, item]));
  for (const stage of stages) {
    assert.equal(stage.targetCount, stage.wasteItemIds.length);
    assert.ok(stage.targetCount > 0);
    for (const id of stage.wasteItemIds) {
      const item=playable.get(id);
      assert.ok(item, `${stage.id}: ${id} has no playable item`);
      assert.ok(item.explanationTh.trim() && item.disposalTipTh.trim());
    }
  }
});
test('all 15 illustrated waste items appear in a playable stage', () => {
  assert.equal(guideItems.length, 15);
  const playableIds=new Set(stages.flatMap(stage=>stage.wasteItemIds));
  for (const item of guideItems) assert.ok(playableIds.has(item.id), `${item.id} missing from every stage`);
});
